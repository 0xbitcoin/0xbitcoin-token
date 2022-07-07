import { TASK_TEST_SOLIDITY } from '@mangrovedao/hardhat-test-solidity'
import { TASK_TEST } from 'hardhat/builtin-tasks/task-names'
import { task } from 'hardhat/config'

task(TASK_TEST)
  .addFlag('onlySol', 'Only run tests written in Solidity')
  .addFlag('onlyTs', 'Only run tests written in TypeScript')
  .setAction(async (args, hre, runSuper) => {
    const { onlySol, onlyTs, ...restArgs } = args
    const runAll = !onlySol && !onlyTs

    // Disable logging
    process.env.DISABLE_LOGS = 'true'

    if (runAll || onlySol)
      await hre.run(TASK_TEST_SOLIDITY, {
        ...restArgs,
        contracts: restArgs.testFiles,
      })
    if (runAll || onlyTs) await runSuper(restArgs)
  })
