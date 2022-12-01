interface Configuration {
  Application: (new () => unknown) | null
}

const configuration: Configuration = {
  Application: null,
}

export function configure({ Application = null }: Partial<Configuration>) {
  configuration.Application = Application
}

configure.getApp = () => configuration.Application
