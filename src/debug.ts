import {environmentDecoder, asString, DecodeType, asNumber, asBoolean} from "./"

const env = environmentDecoder({
    USER: asString,
    WHAT: asString,
    WHY: asNumber,
    FAIL: asBoolean
})

type Stuff = DecodeType<typeof env>

const a: Stuff = {
    USER: '',
    WHAT: '123',
    WHY: 123,
    FAIL: false
}

console.log(a, env)
