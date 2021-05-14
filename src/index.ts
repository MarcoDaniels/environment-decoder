type JSTypePrimitive = string | boolean | number | null | undefined
type JSTypeObject = { [key: string]: JSType }
type JSType = JSTypePrimitive | JSTypeObject

type DecoderTypePrimitive = string
type DecoderTypeObject = { [key: string]: unknown }
type DecoderType = DecoderTypePrimitive | DecoderTypeObject

type DecodeFnType<T> = (input: JSType) => T

type DecodeDecoder<decoder> = [decoder] extends [DecoderTypePrimitive]
    ? decoder
    : { [key in keyof decoder]: DecodeType<decoder[key]> }

export type DecodeType<decoder> = (decoder extends DecodeFnType<infer T>
    ? [DecodeType<T>]
    : decoder extends DecoderType
        ? [DecodeDecoder<decoder>]
        : [decoder])[0]

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

export const environmentDecoder = <S>(schemaType: S): DecodeType<S> => {
    const environment = process.env
    const schema = Object.entries(schemaType)

    const missing = schema.filter(([key]) => !environment.hasOwnProperty(key)).map(([key]) => key)
    if (missing.length) {
        throw `Missing environment variables: \n${missing.join(`\n`)}\n`
    }

    return schema
        .map(([key, decoder]: [string, any]) => {
            try {
                const value = environment[key]
                return [key, decoder(value)]
            } catch (message) {
                throw `Error for environment "${key}": ${message}\n`
            }
        })
        .reduce((acc, [key, value]) => ({...acc, [key]: value}), {})
}
