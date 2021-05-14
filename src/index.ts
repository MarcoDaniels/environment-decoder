import {DecodeFnType, JSType, DecodeType} from './types'

export {DecodeType} from './types'

export const asString: DecodeFnType<string> = (s: JSType) => {
    if (typeof s !== 'string') {
        throw `Type "${typeof s}" of ${JSON.stringify(s)} is not a string`
    }
    return s
}

export const asNumber: DecodeFnType<number> = (n: JSType) => {
    if (typeof n !== 'number') {
        if (isNaN(Number(asString(n)))) {
            throw `Value ${JSON.stringify(n)} cannot be cast to number`
        }
        return Number(asString(n))
    }
    return n
}

export const asBoolean: DecodeFnType<boolean> = (b: JSType) => {
    if (typeof b !== 'boolean') {
        switch (asString(b)) {
            case '0':
            case 'false':
                return false
            case '1':
            case 'true':
                return true
            default:
                throw `Value ${JSON.stringify(b)} cannot be cast to boolean`
        }
    }
    return b
}

const fieldDecoder: unique symbol = Symbol('field-decoder')
const optionalDecoder: unique symbol = Symbol('optional-decoder')
const decode = <D>(decoder: D): DecodeFnType<D> => decoder as any

export const environmentDecoder = <schema>(s: schema): DecodeType<schema> => {
    const env = process.env

    return Object.entries(s)
        .map(([key, decoder]: [string, any]) => {
            if (decoder[fieldDecoder] === true) {
                return [key, decode(decoder)(env)]
            }
            if (!env.hasOwnProperty(key)) {
                if ((decoder)[optionalDecoder]) {
                    return [key, undefined]
                }
                throw `Cannot find key \`${key}\` in \`${JSON.stringify(env)}\``
            }
            try {
                const jsonvalue = env[key]
                return [key, decode(decoder)(jsonvalue)]
            } catch (message) {
                throw (
                    message +
                    `\nwhen trying to decode the key \`${key}\` in \`${JSON.stringify(
                        env,
                    )}\``
                )
            }
        })
        .reduce((acc, [key, value]) => ({...acc, [key]: value}), {})
}
