import {environmentDecoder, asString, asNumber} from "./"

const env = environmentDecoder({
    USER: asString,
    WHAT: asNumber,
    WHY: asString
})

console.log(env)
