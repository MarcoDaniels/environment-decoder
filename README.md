# environment decoder

> A decoder for the `process.env`

`environment-decoder` allows you to define an "interface" for the environment variables you need for your application
and validates them.

This library took a big inspiration from typescript-json-decoder, the main differences are that `process.env` is just a
record type (no need to nested decode)
and since all `process.env` values default to `string` in `environment-decoder` you can cast the value to the desired
type ([see usage](#usage)).

## Idea (read struggle)

For most applications we have to **trust** that the environment flags are set **correctly** and often we see cases like:

```typescript
server.listen(Number(process.env.PORT || 8080))

// or

// we are certain this is set by someone
if (process.env.FEATURE_FLAG!) {
    // ...
}

// or

// sure, this is fine
const baseURL = process.env.BASE_URL || ''
fetch(`${baseURL}/api`)
    .then(response => response.json())
```

This creates a lot of uncertainty: are the environment flags set? what are their "real" types?

## Usage

With `environment-decoder` you define a decoder for your environment variable names, and their corresponded types.

Since all environment variables are set as `string`, the decoder type primitives are written with `asType` as we will be
casting (and validating) each variable.

```typescript
import {environmentDecoder, asBoolean, asString, asNumber} from 'environment-decoder'

const myEnv = environmentDecoder({
    BASE_URL: asString,
    PORT: asNumber,
    FEATURE_FLAG: asBoolean
})

console.log(myEnv.BASE_PATH) // will output the process.env.BASE_PATH value
```

You can also use the output type created by `environmentDecoder` with `DecodeType<typeof ...>`:

```typescript
import {environmentDecoder, asBoolean, asString, asNumber, DecodeType} from 'environment-decoder'

const myEnv = environmentDecoder({
    BASE_URL: asString,
    PORT: asNumber,
    FEATURE_FLAG: asBoolean
})

type MyEnvType = DecodeType<typeof myEnv>

const funWithEnv = (envParam: MyEnvType) => {
    console.log(envParam.FEATURE_FLAG)
}
````

## Notes

`environment-decoder` will throw exceptions for:

* the environment variables are not set (will list all missing variables)
* the environment variable cannot be cast to type (ex: using `asNumber` on `abcde`)

It would be recommended to use `environmentDecoder` at the entry point of the application in order to catch errors as
early as possible.