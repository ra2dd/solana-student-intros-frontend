import { Card } from './Card'
import { FC, useEffect, useState } from 'react'
import { StudentIntro } from '../models/StudentIntro'
import * as web3 from '@solana/web3.js'
import { StudentIntroCoordinator } from '../utils/StudentIntroCoordinator'
import { Center, HStack, Spacer, Button, Input } from '@chakra-ui/react'

const STUDENT_INTRO_PROGRAM_ID = 'HdE95RSVsdb315jfJtaykXhXY478h53X6okDupVfY9yf'
const perPage = 10

export const StudentIntroList: FC = () => {
    const [studentIntros, setStudentIntros] = useState<StudentIntro[]>([])
    const connection = new web3.Connection(web3.clusterApiUrl('devnet'))
    const [page, setPage] = useState(1)
    const [search, setSearch] = useState('novalue')

    useEffect(() => {
        StudentIntroCoordinator.fetchPage(connection, page, perPage, search, search != 'novalue')
        .then(setStudentIntros)
    }, [page, search])
    
    return (
        <div>
            <Center>
                <Input 
                    id='search'
                    color='gray.400'
                    onChange={event => setSearch(event.target.value)}
                    placeholder='Search'
                    w='97%'
                    mt={2}
                    mb={2}
                    />
            </Center>
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