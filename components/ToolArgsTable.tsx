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
                <TimePreview value={value} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

const ONE_MONTH = 1000 * 60 * 60 * 24 * 30;

const TimePreview = ({ value }: { value: any }) => {
  let date: Date | undefined;
  if (typeof value === "number") {
    date = new Date(value * 1000);
    if (isNaN(date.getTime())) {
      date = undefined;
    }
  }

  if (!date || Math.abs(Date.now() - +date) > ONE_MONTH) return null;

  return (
    <span className="text-xs opacity-50 ml-2">
      {date.toLocaleTimeString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      })}
    </span>
  );
};
