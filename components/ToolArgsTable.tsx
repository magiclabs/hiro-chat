import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function ToolArgsTable({ args }: { args: Record<string, string> }) {
  const data = Object.entries(args);

  return (
    <div className="rounded-md border bg-background">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[200px]">Arg</TableHead>
            <TableHead>Value</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map(([argName, value], index) => (
            <TableRow key={index}>
              <TableCell className="font-medium">{argName}</TableCell>
              <TableCell>
                {Array.isArray(value) ? value.join(", ") : value}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
