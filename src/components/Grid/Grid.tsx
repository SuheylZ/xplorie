import uuid from 'uuid'
import react from "react"

type IdType = { id: number | string }

type GridProps<T extends IdType> = {
  rows: T[]
  total: number

  onRowClicked?: (id: IdType)=>Promise<void>
  onRowDoubleClicked?: (id: IdType)=>Promise<void>,
  onPageChanged?: (page: number, size: number) => void
}
 

export function useId() {
  const getId = () => uuid.v4()
  return getId
}


const context = react.createContext<IdType[]|undefined>(undefined)


export function Grid<T extends IdType>(props: GridProps<T>) {
  const id = useId()

  return (
   <context.Provider value={props.rows}>
    <table id={id()}>`  
    
    
    </table>
  </context.Provider>
  )
}


export type GridFieldProps<T> = {
  field: (row:T) => number | string | boolean | JSX.Element
  visible? : boolean
  onRowClicked?: (id: IdType)=>Promise<void>
  onRowDoubleClicked?: (id: IdType)=>Promise<void>,
  onPageChanged?: (page: number, size: number) => void
}



export function GridField<T>(props: GridFieldProps<T>){
  return (

    <td> </td>
  )
}

interface MyGrid<T extends IdType> extends  React.FC<GridProps<T>>{
   Field: React.FC<GridFieldProps<T>>[]
}

const CustomGrid: MyGrid<T> ={
 

}

CustomGrid.Field = (props: ) {

  return <></>
}