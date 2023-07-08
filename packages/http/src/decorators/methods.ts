import { factoryMethodDecorator } from '../tools/factoryMethodDecorator.js'

export const GET = factoryMethodDecorator('GET')

export const HEAD = factoryMethodDecorator('HEAD')

export const POST = factoryMethodDecorator('POST')

export const PUT = factoryMethodDecorator('PUT')

export const DELETE = factoryMethodDecorator('DELETE')

export const CONNECT = factoryMethodDecorator('CONNECT')

export const OPTIONS = factoryMethodDecorator('OPTIONS')

export const TRACE = factoryMethodDecorator('TRACE')

export const PATCH = factoryMethodDecorator('PATCH')
