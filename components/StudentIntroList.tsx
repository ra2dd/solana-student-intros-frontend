import { Card } from './Card'
import { FC, useEffect, useState } from 'react'
import { StudentIntro } from '../models/StudentIntro'
import * as web3 from '@solana/web3.js'
import { StudentIntroCoordinator } from '../utils/StudentIntroCoordinator'
import { Center, HStack, Spacer, Button } from '@chakra-ui/react'

const STUDENT_INTRO_PROGRAM_ID = 'HdE95RSVsdb315jfJtaykXhXY478h53X6okDupVfY9yf'
const perPage = 10

export const StudentIntroList: FC = () => {
    const [studentIntros, setStudentIntros] = useState<StudentIntro[]>([])
    const connection = new web3.Connection(web3.clusterApiUrl('devnet'))
    const [page, setPage] = useState(1)

    useEffect(() => {
        StudentIntroCoordinator.fetchPage(connection, page, perPage)
        .then(setStudentIntros)
    }, [page])
    
    return (
        <div>
            {
                studentIntros.map((studentIntro, i) => <Card key={i} studentIntro={studentIntro} /> )
            }
            <Center>
                <HStack w='full' mt={2} mb={8} ml={4} mr={4}>
                    {
                        page > 1 && <Button onClick={() => setPage(page - 1)}>Previous</Button>
                    }
                    <Spacer />
                    {
                        StudentIntroCoordinator.accounts.length > page * perPage &&
                            <Button onClick={() => setPage(page + 1)}>Next</Button>
                    }
                </HStack>
            </Center>
        </div>
    )
}