type JSPrimitive = string | boolean | number | null | undefined
type JSObject = { [key: string]: JS }
type JS = JSPrimitive | JSObject

type DecodeFn<T> = (input: JS) => T

export const literal = <p extends string>(literal: p): DecodeFn<p> => (value: JS) => {
    if (literal !== value) {
        throw `Value "${JSON.stringify(value)}" is not the literal "${JSON.stringify(literal)}"`
    }
    return literal
}

export const string: DecodeFn<string> = (s: JS) => {
    if (typeof s !== 'string') {
        throw `Type "${typeof s}" of ${JSON.stringify(s)} is not a primitive type`
    }
    return s
}

export const number: DecodeFn<number> = (n: JS) => {
    if (typeof n !== 'number') {
        if (isNaN(Number(string(n)))) {
            throw `Value ${JSON.stringify(n)} cannot be cast to number`
        }
        return Number(string(n))
    }
    return n
}

export const boolean: DecodeFn<boolean> = (b: JS) => {
    if (typeof b !== 'boolean') {
        switch (string(b)) {
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

const decode = <D>(decoder: D): DecodeFn<D> => decoder as any

const fieldDecoder: unique symbol = Symbol('field-decoder')
const optionalDecoder: unique symbol = Symbol('optional-decoder')

type DecoderPrimitive = string
type DecoderObject = { [key: string]: unknown }
type Decoder = DecoderPrimitive | DecoderObject

type DecodeDecoder<decoder> =
    [decoder] extends [DecoderPrimitive] ?
        decoder :
        [decoder] extends [[infer decoderA, infer decoderB]] ?
            [DecodeType<decoderA>, DecodeType<decoderB>] :
            { [key in keyof decoder]: DecodeType<decoder[key]> }

export type DecodeType<decoder> =
    (decoder extends DecodeFn<infer T> ?
        [DecodeType<T>] : decoder extends Decoder ?
            [DecodeDecoder<decoder>] : [decoder]
        )[0]


export const environmentDecoder = <schema>(
    env: NodeJS.ProcessEnv,
    s: schema
): DecodeType<schema> => Object.entries(s)
    .map(([key, decoder]: [string, any]) => {
        if (decoder[fieldDecoder] === true) {
            return [key, decode(decoder)(env)]
        }
        // TODO: can we error for all?!
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
