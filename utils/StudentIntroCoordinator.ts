import * as web3 from '@solana/web3.js'
import { StudentIntro } from '../models/StudentIntro'
import bs58 from 'bs58'

const STUDENT_INTRO_PROGRAM_ID = 'HdE95RSVsdb315jfJtaykXhXY478h53X6okDupVfY9yf'

export class StudentIntroCoordinator {
    static accounts: web3.PublicKey[] = []

    static async prefetchAccounts(connection: web3.Connection, search: string) {
        const prefetchedAccounts = await connection.getProgramAccounts(
            new web3.PublicKey(STUDENT_INTRO_PROGRAM_ID),
            {
                dataSlice: { offset: 1, length: 11},
                filters: search === '' || search === 'novalue' ? [] : [
                    {
                        memcmp: 
                            {
                                offset: 5,
                                bytes: bs58.encode(Buffer.from(search))
                            }
                    }
                ]
            }
        )

        prefetchedAccounts.sort((a,b) => {
            const lengthA = a.account.data.readUInt32LE(0)
            const lengthB = b.account.data.readUInt32LE(0)
            const dataA = a.account.data.slice(4, 4 + lengthA)
            const dataB = b.account.data.slice(4, 4 + lengthB)
            return dataA.compare(dataB)
        })

        let blank = true
        let counter = 0

        // count empty names in account to slice it later
        while (blank == true && counter < 30) {
            const accountData = await connection.getAccountInfo(prefetchedAccounts[counter]?.pubkey)
            // console.log(StudentIntro.deserialize(accountData?.data.name))
            if (StudentIntro.deserialize(accountData?.data)?.name == '') {
                counter++;
            } else {
                blank = false
            }

        }

        this.accounts = prefetchedAccounts.slice(counter, prefetchedAccounts.length).map(account => account.pubkey)
    }

    static async fetchPage(connection: web3.Connection, page: number, perPage: number, search: string, reload: boolean = false): Promise<StudentIntro[]> {
        if (this.accounts.length == 0 || reload) {
            await this.prefetchAccounts(connection, search)
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