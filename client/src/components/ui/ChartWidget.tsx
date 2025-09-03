import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

interface ChartWidgetProps {
  type: "line" | "pie";
  data: any[];
  title: string;
}

const COLORS = ["#14532d", "#d97706", "#facc15"];

const ChartWidget: React.FC<ChartWidgetProps> = ({ type, data, title }) => {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="font-semibold text-green-900 mb-4">{title}</h3>
      <div className="h-60">
        <ResponsiveContainer width="100%" height="100%">
          {type === "line" ? (
            <LineChart data={data}>
              <XAxis dataKey="month" stroke="#14532d" />
              <YAxis stroke="#14532d" />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#d97706" strokeWidth={2} />
            </LineChart>
          ) : (
            <PieChart>
              <Pie data={data} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} fill="#14532d" label>
                {data.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ChartWidget;
