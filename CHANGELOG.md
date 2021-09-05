# Changelog [![GitHub release](https://img.shields.io/github/v/release/marcodaniels/environment-decoder?include_prereleases)](https://www.npmjs.com/package/environment-decoder)

All notable changes to
[the `envitonment-decoder` npm package](https://www.npmjs.com/package/environment-decoder)
will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.2.0] - 2021-09-05

### Added

- Functionality to add default value for non-required environment flag. Expand the functions `as{Type}` to
  include `.withDefault({type})`, fx: `asBoolean.withDefault(false)`
- Changelog file.

## [1.1.0] - 2021-05-18

### Added

- Documentation with examples for React.js and Node.js application.

### Changed

- Validation for missing environment variables will now be gathered and throw once will all missing environment
  variables.

## [1.0.0] - 2021-05-14

### Added

- Decode environment variables into a typed object.
