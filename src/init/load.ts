import { exec } from '../core'
import { Context } from './types'
import ora from 'ora'

/**
 * Load template config.
 * @todo
 * - Adapt to any repository?
 * - Check template is available.
 */
export default async (ctx: Context): Promise<void> => {
  // default template name
  ctx.config.name = ctx.template

  try {
    // install Template deps ? (XXX: move this into its own middleware ?)
    if (ctx.options.tpldeps) {
      const spinner = ora('Installing template dependencies...').start()
      try {
        const client = 'npm'
        /* istanbul ignore next */
        const cmd = process.platform === 'win32' ? client + '.cmd' : client
        await exec(cmd, ['install'], { cwd: ctx.src, stdio: 'inherit' })
        spinner.succeed('Template dependencies installed.')
      } catch (e) {
        spinner.stop()
        throw new Error('Install template dependencies failed.')
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const mod = require(ctx.src)

    if (Object.prototype.toString.call(mod) !== '[object Object]') {
      throw new TypeError('template needs to expose an object.')
    }

    Object.assign(ctx.config, mod)
  } catch (e: any) {
    if (e.code === 'MODULE_NOT_FOUND' && ctx.options.debug !== true)
      throw new Error(`Could not load template module [${e.message.split('\n')[0]}] 
        Did you load template dependencies with \`-t\` flag ? 
        Use --debug option for more info`)

    throw e
  }
}
