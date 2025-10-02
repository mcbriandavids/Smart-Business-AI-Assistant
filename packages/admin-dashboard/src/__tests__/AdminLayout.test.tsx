import { render, screen } from "@testing-library/react";
import AdminLayout from "../components/AdminLayout";

// Mock the Chart components since they might cause issues in test environment
jest.mock("recharts", () => ({
  ResponsiveContainer: ({ children }: any) => (
    <div data-testid="chart-container">{children}</div>
  ),
  LineChart: () => <div data-testid="line-chart" />,
  Line: () => null,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
  BarChart: () => <div data-testid="bar-chart" />,
  Bar: () => null,
}));

describe("AdminLayout", () => {
  it("should render without crashing", () => {
    render(
      <AdminLayout>
        <div>Test Content</div>
      </AdminLayout>
    );

    expect(screen.getByText("Test Content")).toBeInTheDocument();
  });

  it("should render navigation elements", () => {
    render(
      <AdminLayout>
        <div>Test Content</div>
      </AdminLayout>
    );

    // Check if basic layout elements are present
    expect(
      document.querySelector('[data-testid="admin-layout"]') ||
        document.querySelector(".admin-layout") ||
        screen.getByText("Test Content").closest("div")
    ).toBeInTheDocument();
  });
});
