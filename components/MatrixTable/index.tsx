import React, { useState, useContext } from 'react';
import classnames from 'classnames'
import {Table,Thead,Tbody,Tr,Th,Td,TableContainer,Input,Button} from "@chakra-ui/react";
import Axios from "axios";
import useSWR from "swr";
import { MatrixTableContext, MatrixTableContextProvider } from './context'

type Props = {
  initialMatrix?: import('../../types').Matrix
} & import('react').HTMLAttributes<HTMLDivElement>

/**
 * Add 4 buttons: 
 * - Cancel to reset the matrix to how it was before changing the values (only when in edit mode)
 * - Edit to make the fields editable (only when not in edit mode)
 * - Clear to completely clear the table
 * - Save to save the table
 * @param param0 
 */

const MatrixTable: import('react').FC<Omit<Props, 'initialMatrix'>> = ({ className, children, ...props }) => {

  // State ------------------------------------------------------------------- //
  const [{ matrix }, dispatch] = useContext(MatrixTableContext)
  const [enableRow, setEnableRow] = useState('0')
  const [whenChange,setWhenChange] = useState(false)
  const [lite, setLite] = useState(0)
  const [standard, setStandard] = useState(0)
  const [unlimited, setUnlimited] = useState(0)

  const SaveInDataBase = async () => {
    const response = await Axios.post("http://localhost:3000/api/save-pricing", {data: matrix})
  }

  const EditTable = async (row) => {
    setEnableRow(row);
    setLite(matrix[row].lite)
    setStandard(matrix[row].standard)
    setUnlimited(matrix[row].unlimited)
  }

  const SaveTemporaryTable = async (row) => {
    matrix[row] = {lite: lite, standard: standard, unlimited: unlimited}
    dispatch({
      type: 'Modify',
      payload: {...matrix}
    })
    setEnableRow('0')
  }

  const ClearTable = async () => {
    dispatch({
      type: 'ClearTable',
      payload: matrix
    })
    setEnableRow('0')
  }
  
  return (
    <div className={classnames(['container', className])} {...props}>
      <center><Button colorScheme='blue' onClick={() => SaveInDataBase()}> Save Table In DataBase </Button></center>
      <br></br>
      <br></br>
      <TableContainer width={"full"}>
        <Table variant={"simple"}>
          <Thead>
            <Tr>
              <Th></Th>
              <Th>lite</Th>
              <Th>standard</Th>
              <Th>unlimited</Th>
              <Th>
              <Button hidden={enableRow=='0'} colorScheme='blue' onClick={() => ClearTable()}> Clear All Table </Button>
              <Button hidden={whenChange==false} colorScheme='blue' style={{margin: '0px 10px'}} onClick={() => {SaveTemporaryTable(enableRow);
                                                                                                                 setWhenChange(false);          
                                                                                                                }}> Temporary Save </Button>
              </Th>
            </Tr>
          </Thead>
          <Tbody>
            {Object.keys(matrix).map((row) => (
              <Tr key={row}>
                <Td > {row} </Td>

                {row != enableRow ? <Td> {matrix[row].lite} </Td>:
                  <Td><Input value={lite} onChange={(e) => {setLite(parseInt(e.target.value));
                                                            setStandard(parseInt(e.target.value)*2);
                                                            setUnlimited(parseInt(e.target.value)*3);
                                                            setWhenChange(true);
                                                            }} placeholder="lite" /></Td>
                }

                {row != enableRow ? <Td > {matrix[row].standard} </Td>:
                  <Td><Input value={standard} onChange={(e) => {setStandard(parseInt(e.target.value));
                                                                setWhenChange(true);
                                                                }} placeholder="standard" /></Td>
                }

                {row != enableRow ? <Td> {matrix[row].unlimited} </Td>:
                  <Td><Input value={unlimited} onChange={(e) => {setUnlimited(parseInt(e.target.value));
                                                                 setWhenChange(true);
                                                                 }} placeholder="unlimited" /></Td>
                }

                <Td >

                  {row != enableRow ? <Button colorScheme='blue' onClick={() => EditTable(row)}> Edit </Button>:
                      <Button colorScheme='blue' onClick={() => {setEnableRow('0');
                                                                 setWhenChange(false);
                                                                }}> Cancel </Button>
                  }
              
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>

      <style jsx>{`.container {}`}</style>
    </div>
  )
}

const MatrixTableWithContext: import('react').FC<Props> = ({ initialMatrix, ...props }) => {
  // You can fetch the pricing here or in pages/index.ts
  // Remember that you should try to reflect the state of pricing in originalMatrix.
  // matrix will hold the latest value (edited or same as originalMatrix)
  
const fetcher = (url: string) =>
fetch(url).then((res: Response) => res.json());
const { data, error } = useSWR("/api/pricing", fetcher);
if (!data)
{
  return <div>Loading...</div>
}

  return (
    <MatrixTableContextProvider initialMatrix={data}>
      <MatrixTable {...props} />
    </MatrixTableContextProvider>
  )
}

export default MatrixTableWithContext
