import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";

const Withdrawal = () => {
  return (
    <div className="p-5 lg:p-20">   
    <h1 className="font-bold text-3xl pb-5">Withdrawal</h1>     
        <Table className="border">
        
        <TableHeader>
            <TableRow>
            <TableHead className="w-[100px] py-5">Date</TableHead>
            <TableHead>Method</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead className="text-right">Status</TableHead>
            </TableRow>
        </TableHeader>
        <TableBody>
            {[1,1,1,1,1,1,1,1,1,1,1,1].map((item,index)=> <TableRow key={index}>
            <TableCell>
                  <p>2025/05/04 11:25</p>
                 
                </TableCell>
                
                
                  <TableCell className="">$69249</TableCell>
                
                
                <TableCell className="">$69249</TableCell>
                <TableCell className="text-right">
                    Sold
                </TableCell>
            </TableRow>)}

        </TableBody>
        </Table>
    </div>
  )
}

export default Withdrawal