import { makeRelativeIfPossible } from '../src/utils'

const origin = 'https://example.org'
const base = `${origin}/foo/`

describe('makeRelativeIfPossible', () => {
    test('returns absolute url if different origin', () => {
        const url = 'https://other.example.org/foo/?test=true#abc'
        expect(makeRelativeIfPossible(base, url)).toBe(url)
    })
    test('returns path from root if different folder', () => {
        const path = '/other/'
        expect(makeRelativeIfPossible(base, `${origin}${path}`)).toBe(path)
    })
    test('returns ./ if it is the same folder', () => {
        expect(makeRelativeIfPossible(base, base)).toBe('./')
    })
    test('returns relative path if it is a file in the folder', () => {
        const fileName = 'file.ext'
        expect(makeRelativeIfPossible(base, `${base}${fileName}`)).toBe(`./${fileName}`)
    })
})