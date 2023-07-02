import { describe, expect, test, beforeEach } from '@jest/globals'
import {
    asBoolean,
    asNumber,
    asNumberUnion,
    asString,
    asStringUnion,
    environmentDecoder,
} from './index'

const decoderWrapper =
    (schema: Parameters<typeof environmentDecoder>[0]) => () =>
        environmentDecoder(schema)

describe('environmentDecoder', () => {
    const env = process.env

    beforeEach(() => {
        process.env = { ...env }
    })

    test('should throw error if environment variable contains disallowed value for asStringUnion', () => {
        process.env.BEER = 'Coca Cola'
        expect(
            decoderWrapper({
                BEER: asStringUnion('Budweiser', 'Heineken', 'Corona'),
            })
        ).toThrowError(
            `Decoder errors: \nBEER: allowed strings are Budweiser, Heineken, Corona, got Coca Cola`
        )
    })

    test('should not throw error if environment variable contains allowed value for asStringUnion', () => {
        process.env.BEER = 'Budweiser'
        expect(
            decoderWrapper({
                BEER: asStringUnion('Budweiser', 'Heineken', 'Corona'),
            })
        ).not.toThrowError()
    })

    test('should throw error if environment variable contains disallowed value for asNumberUnion', () => {
        process.env.WORLD_WAR = '3'
        expect(
            decoderWrapper({
                WORLD_WAR: asNumberUnion(1, 2),
            })
        ).toThrowError(
            `Decoder errors: \nWORLD_WAR: allowed numbers are 1, 2, got 3`
        )
    })

    test('should not throw error if environment variable contains allowed value for asNumberUnion', () => {
        process.env.WORLD_WAR = '1'
        expect(
            decoderWrapper({
                WORLD_WAR: asNumberUnion(1, 2),
            })
        ).not.toThrowError()
    })

    test('withDefault', () => {
        const env = environmentDecoder({
            GAME: asString.withDefault('Diablo'),
            MOVIE: asStringUnion('Batman Begins', 'Inception').withDefault(
                'Inception'
            ),
            AGE: asNumber.withDefault(1),
            YEAR: asNumberUnion(1994, 2023).withDefault(1994),
            IS_COOL: asBoolean.withDefault(true),
        })

        expect(env.GAME).toBe('Diablo')
        expect(env.MOVIE).toBe('Inception')
        expect(env.AGE).toBe(1)
        expect(env.YEAR).toBe(1994)
        expect(env.IS_COOL).toBe(true)
    })

    test('should throw error when environment variable is missing', () => {
        expect(
            decoderWrapper({
                GAME: asString,
                MOVIE: asStringUnion('Batman Begins', 'Inception'),
                AGE: asNumber,
                YEAR: asNumberUnion(1994, 2023),
                IS_COOL: asBoolean,
            })
        ).toThrowError(
            'Missing environment variables: \nGAME\nMOVIE\nAGE\nYEAR\nIS_COOL'
        )
    })

    test('should throw error when variable cannot be cast to number for asNumber and asNumberUnion', () => {
        process.env.AGE = 'not a number'
        process.env.YEAR = 'not a number'

        expect(
            decoderWrapper({
                AGE: asNumber,
                YEAR: asNumberUnion(1994, 2023),
            })
        ).toThrowError(
            'Decoder errors: \nAGE: value "not a number" cannot be cast to number\nYEAR: value "not a number" cannot be cast to number'
        )
    })

    test('should throw error when variable is not a valid boolean for asBoolean', () => {
        process.env.IS_COOL = 'not valid'

        expect(
            decoderWrapper({
                IS_COOL: asBoolean,
            })
        ).toThrowError(
            'Decoder errors: \nIS_COOL: value "not valid" cannot be cast to boolean'
        )
    })
})
