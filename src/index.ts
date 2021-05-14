import {DecodeFnType, JSType, DecodeType} from './types'

export {DecodeType} from './types'

export const asString: DecodeFnType<string> = (s: JSType) => {
    if (typeof s !== 'string') {
        throw `type "${typeof s}" of ${JSON.stringify(s)} is not a string`
    }
    return s
}

export const asNumber: DecodeFnType<number> = (n: JSType) => {
    if (typeof n !== 'number') {
        if (isNaN(Number(asString(n)))) {
            throw `value ${JSON.stringify(n)} cannot be cast to number`
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
                throw `value ${JSON.stringify(b)} cannot be cast to boolean`
        }
    }
    return b
}

const decode = <D>(decoder: D): DecodeFnType<D> => decoder as any

export const environmentDecoder = <S>(schemaType: S): DecodeType<S> => {
    const environment = process.env
    const schema = Object.entries(schemaType)

    const missing = schema.filter(([key]) => !environment.hasOwnProperty(key)).map(([key]) => key)
    if (missing.length) {
        throw (`Missing environment variables: \n${missing.join(`\n`)}\n`)
    }

    return schema
        .map(([key, decoder]: [string, any]) => {
            try {
                const value = environment[key]
                return [key, decode(decoder)(value)]
            } catch (message) {
                throw (`Error for environment "${key}": ${message}\n`)
            }
        })
        .reduce((acc, [key, value]) => ({...acc, [key]: value}), {})
}
