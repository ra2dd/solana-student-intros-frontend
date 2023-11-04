import * as web3 from '@solana/web3.js'
import { StudentIntro } from '../models/StudentIntro'

const STUDENT_INTRO_PROGRAM_ID = 'HdE95RSVsdb315jfJtaykXhXY478h53X6okDupVfY9yf'

export class StudentIntroCoordinator {
    static accounts: web3.PublicKey[] = []

    static async prefetchAccounts(connection: web3.Connection) {
        const prefetchedAccounts = await connection.getProgramAccounts(
            new web3.PublicKey(STUDENT_INTRO_PROGRAM_ID),
            {
                dataSlice: { offset: 0, length: 0},
            }
        )

        this.accounts = prefetchedAccounts.map(account => account.pubkey)
    }

    static async fetchPage(connection: web3.Connection, page: number, perPage: number): Promise<StudentIntro[]> {
        if (this.accounts.length == 0) {
            await this.prefetchAccounts(connection)
        }

        const paginatedPublicKeys = this.accounts.slice(
            (page - 1) * perPage,
            page * perPage,
        )

        if (paginatedPublicKeys.length == 0) {
            return []
        }

        const accountsInfo = await connection.getMultipleAccountsInfo(paginatedPublicKeys)

        const studentIntros = accountsInfo.reduce((accum: StudentIntro[], account) => {
            const studentIntro = StudentIntro.deserialize(account?.data)
            if (!studentIntro) {
                return accum
            }

            return [...accum, studentIntro]
        }, [])

        return studentIntros
    }
}