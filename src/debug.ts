import {environmentDecoder, string, DecodeType, literal} from "./"

const env = environmentDecoder(process.env, {
    USER: string,
    WHAT: literal('123'),
})

type Stuff = DecodeType<typeof env>

const a: Stuff = {
    USER: '',
    WHAT: '123'
}

console.log(a, env)
