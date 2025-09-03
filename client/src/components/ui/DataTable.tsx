interface DataTableProps {
  columns: string[];
  data: (string | number)[][];
}

const DataTable: React.FC<DataTableProps> = ({ columns, data }) => {
  return (
    <div className="bg-white rounded-lg shadow overflow-x-auto">
      <table className="min-w-full text-left">
        <thead>
          <tr>
            {columns.map((col, idx) => (
              <th key={idx} className="p-4 text-green-900 border-b">{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i} className="border-b hover:bg-amber-50">
              {row.map((cell, j) => (
                <td key={j} className="p-4">{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;
