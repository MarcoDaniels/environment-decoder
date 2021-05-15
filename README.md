# environment decoder

[![Publish](https://github.com/marcodaniels/environment-decoder/workflows/Publish/badge.svg)](https://github.com/MarcoDaniels/environment-decoder/releases)
[![GitHub release](https://img.shields.io/github/v/release/marcodaniels/environment-decoder?include_prereleases)](https://www.npmjs.com/package/environment-decoder)

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

### Add it to your project

```
yarn add environment-decoder

// or

npm install environment-decoder
```

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

All exceptions will be thrown at run time, so it would be recommended to use `environmentDecoder` as close as possible
to the entry point of the application in order to catch errors as early as possible.

## Examples

Use it as React.js hook:

_remember to use Error boundaries to handle exceptions thrown on your app_
```typescript jsx
// useEnvironment.js
import {asString, environmentDecoder} from 'environment-decoder'

export const useEnvironment = function () {
    // if environment is not set will throw at this step
    return environmentDecoder({
        REACT_APP_MY_ENV_TEST: asString,
        NODE_ENV: asString
    })
}

// App.js
import {useEnvironment} from './useEnvironment'

function App() {
    const env = useEnvironment()
    return (
        <div>
            <h1>{env.REACT_APP_MY_ENV_TEST}</h1>
        </div>
    )
}
```

Use it in a Node.js application:

```javascript
const fetch = require('node-fetch')
const {environmentDecoder, asString} = require('environment-decoder')

// if environment is not set will throw at this step
const config = environmentDecoder({
    FETCH_URL: asString,
    ACCESS_TOKEN: asString
})

const response = await fetch(config.FETCH_URL, {
    method: 'get',
    headers: {
        'Authorization': `Bearer ${config.ACCESS_TOKEN}`,
        'Content-type': 'application/json'
    }
})

const messageData = await response.json()
```