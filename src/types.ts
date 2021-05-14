export type JSTypePrimitive = string | boolean | number | null | undefined
export type JSTypeObject = { [key: string]: JSType }
export type JSType = JSTypePrimitive | JSTypeObject

export type DecoderTypePrimitive = string
export type DecoderTypeObject = { [key: string]: unknown }
export type DecoderType = DecoderTypePrimitive | DecoderTypeObject

export type DecodeFnType<T> = (input: JSType) => T

export type DecodeType<decoder> =
    (decoder extends DecodeFnType<infer T> ?
        [DecodeType<T>] : decoder extends DecoderType ?
            [DecodeDecoder<decoder>] : [decoder]
        )[0]

export type DecodeDecoder<decoder> =
    [decoder] extends [DecoderTypePrimitive] ?
        decoder :
        [decoder] extends [[infer decoderA, infer decoderB]] ?
            [DecodeType<decoderA>, DecodeType<decoderB>] :
            { [key in keyof decoder]: DecodeType<decoder[key]> }

