import React, { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  AlertTriangle,
  CheckCircle2,
  Trash2,
  Plus,
  Bell,
  Wallet,
  IndianRupee,
} from "lucide-react";

const STORAGE_KEY = "anand-budget-monitor-v2";

const DEFAULT_BUDGETS = [
  { id: 1, category: "Home Loan EMI", budget: 8200, spent: 8200 },
  { id: 2, category: "Personal Loan EMI", budget: 8900, spent: 8900 },
  { id: 3, category: "Household", budget: 3600, spent: 0 },
  { id: 4, category: "Credit Card", budget: 3000, spent: 0 },
  { id: 5, category: "Paytm Postpaid", budget: 1500, spent: 0 },
  { id: 6, category: "Power Bills", budget: 2000, spent: 0 },
  { id: 7, category: "Amazon Home Bills", budget: 1000, spent: 0 },
  { id: 8, category: "Health Insurance", budget: 1000, spent: 0 },
  { id: 9, category: "Internet", budget: 700, spent: 0 },
  { id: 10, category: "Emergency Savings", budget: 3000, spent: 0 },
];

const DEFAULT_BILLS = [
  { id: 1, name: "Home Loan EMI", amount: 8200, dueDay: 5, paid: false },
  { id: 2, name: "Personal Loan EMI", amount: 8900, dueDay: 5, paid: false },
  { id: 3, name: "Credit Card", amount: 3000, dueDay: 8, paid: false },
  { id: 4, name: "Paytm Postpaid", amount: 1500, dueDay: 10, paid: false },
  { id: 5, name: "Health Insurance", amount: 1000, dueDay: 10, paid: false },
  { id: 6, name: "Internet Bill", amount: 700, dueDay: 12, paid: false },
  { id: 7, name: "Power Bill", amount: 2000, dueDay: 15, paid: false },
];

function formatCurrency(value) {
  return `₹${Number(value || 0).toLocaleString("en-IN")}`;
}

export default function BudgetMonitorApp() {
  const [salary, setSalary] = useState(36000);
  const [emergencyFund, setEmergencyFund] = useState(50000);
  const [items, setItems] = useState(DEFAULT_BUDGETS);
  const [bills, setBills] = useState(DEFAULT_BILLS);

  const [newCategory, setNewCategory] = useState("");
  const [newBudget, setNewBudget] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return;

    try {
      const data = JSON.parse(saved);
      setSalary(data.salary ?? 36000);
      setEmergencyFund(data.emergencyFund ?? 50000);
      setItems(data.items ?? DEFAULT_BUDGETS);
      setBills(data.bills ?? DEFAULT_BILLS);
    } catch (error) {
      console.error("Failed to load saved data", error);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ salary, emergencyFund, items, bills })
    );
  }, [salary, emergencyFund, items, bills]);

  const totalBudget = useMemo(
    () => items.reduce((sum, item) => sum + Number(item.budget || 0), 0),
    [items]
  );

  const totalSpent = useMemo(
    () => items.reduce((sum, item) => sum + Number(item.spent || 0), 0),
    [items]
  );

  const remaining = salary - totalSpent;
  const usagePercent =
    salary > 0 ? Math.min((totalSpent / salary) * 100, 100) : 0;

  const totalLoanEmi = useMemo(() => {
    return items
      .filter((item) => item.category.toLowerCase().includes("loan"))
      .reduce((sum, item) => sum + Number(item.spent || 0), 0);
  }, [items]);

  const debtRatio = (totalLoanEmi / Math.max(salary, 1)) * 100;

  const today = new Date().getDate();

  const upcomingBills = bills.filter(
    (bill) => !bill.paid && bill.dueDay >= today && bill.dueDay - today <= 5
  );

  const overdueBills = bills.filter(
    (bill) => !bill.paid && bill.dueDay < today
  );

  const updateItem = (id, field, value) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              [field]: field === "category" ? value : Number(value) || 0,
            }
          : item
      )
    );
  };

  const addCategory = () => {
    if (!newCategory.trim() || !newBudget) return;

    setItems((prev) => [
      ...prev,
      {
        id: Date.now(),
        category: newCategory.trim(),
        budget: Number(newBudget),
        spent: 0,
      },
    ]);

    setNewCategory("");
    setNewBudget("");
  };

  const deleteItem = (id) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const toggleBillPaid = (id) => {
    setBills((prev) =>
      prev.map((bill) =>
        bill.id === id ? { ...bill, paid: !bill.paid } : bill
      )
    );
  };

  const resetBills = () => {
    setBills((prev) => prev.map((bill) => ({ ...bill, paid: false })));
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Personal Budget Monitor</h1>
          <p className="text-slate-600 mt-1">
            Track salary, EMIs, expenses, emergency savings, and bill reminders.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="rounded-2xl shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IndianRupee className="w-5 h-5" /> Monthly Salary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                type="number"
                value={salary}
                onChange={(e) => setSalary(Number(e.target.value) || 0)}
              />
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-sm">
            <CardHeader>
              <CardTitle>Total Spent</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">
                {formatCurrency(totalSpent)}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-sm">
            <CardHeader>
              <CardTitle>Remaining</CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className={`text-2xl font-semibold ${
                  remaining < 0 ? "text-red-600" : "text-green-600"
                }`}
              >
                {formatCurrency(remaining)}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="w-5 h-5" /> Emergency Fund
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                type="number"
                value={emergencyFund}
                onChange={(e) =>
                  setEmergencyFund(Number(e.target.value) || 0)
                }
              />
            </CardContent>
          </Card>
        </div>

        {(overdueBills.length > 0 || upcomingBills.length > 0) && (
          <Card className="rounded-2xl shadow-sm border-amber-300 bg-amber-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" /> Bill Reminders
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {overdueBills.map((bill) => (
                <div key={`overdue-${bill.id}`} className="text-red-600">
                  Overdue: {bill.name} ({formatCurrency(bill.amount)})
                </div>
              ))}
              {upcomingBills.map((bill) => (
                <div key={`upcoming-${bill.id}`} className="text-amber-700">
                  Due soon: {bill.name} ({formatCurrency(bill.amount)}) on day {bill.dueDay}
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        <Card className="rounded-2xl shadow-sm">
          <CardHeader>
            <CardTitle>
              Budget Utilization ({usagePercent.toFixed(1)}%)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Progress value={usagePercent} />

            {remaining < 0 ? (
              <div className="flex items-center gap-2 text-red-600 font-medium">
                <AlertTriangle className="w-5 h-5" />
                Warning: You are over budget by {formatCurrency(Math.abs(remaining))}
              </div>
            ) : remaining < 3000 ? (
              <div className="flex items-center gap-2 text-amber-600 font-medium">
                <AlertTriangle className="w-5 h-5" />
                Alert: Remaining balance is below ₹3,000.
              </div>
            ) : (
              <div className="flex items-center gap-2 text-green-600 font-medium">
                <CheckCircle2 className="w-5 h-5" />
                Your budget is under control.
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm">
          <CardHeader>
            <CardTitle>Expense Categories</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {items.map((item) => {
              const percent =
                item.budget > 0 ? (item.spent / item.budget) * 100 : 0;
              const overBudget = item.spent > item.budget;

              return (
                <div
                  key={item.id}
                  className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center border rounded-xl p-3"
                >
                  <Input
                    className="md:col-span-3"
                    value={item.category}
                    onChange={(e) =>
                      updateItem(item.id, "category", e.target.value)
                    }
                  />

                  <Input
                    className="md:col-span-2"
                    type="number"
                    value={item.budget}
                    onChange={(e) =>
                      updateItem(item.id, "budget", e.target.value)
                    }
                  />

                  <Input
                    className="md:col-span-2"
                    type="number"
                    value={item.spent}
                    onChange={(e) =>
                      updateItem(item.id, "spent", e.target.value)
                    }
                  />

                  <div className="md:col-span-4">
                    <Progress value={Math.min(percent, 100)} />
                    <div
                      className={`text-sm mt-1 ${
                        overBudget ? "text-red-600" : "text-slate-500"
                      }`}
                    >
                      {percent.toFixed(0)}% used
                      {overBudget ? " • Over budget" : ""}
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="md:col-span-1"
                    onClick={() => deleteItem(item.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              );
            })}

            <div className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center border-t pt-4">
              <Input
                className="md:col-span-5"
                placeholder="New category"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
              />

              <Input
                className="md:col-span-3"
                type="number"
                placeholder="Budget"
                value={newBudget}
                onChange={(e) => setNewBudget(e.target.value)}
              />

              <Button className="md:col-span-2" onClick={addCategory}>
                <Plus className="w-4 h-4 mr-2" /> Add
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <CardTitle>Monthly Bills Tracker</CardTitle>
              <Button variant="outline" onClick={resetBills}>
                Reset Month
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {bills.map((bill) => (
              <div
                key={bill.id}
                className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 border rounded-xl p-3"
              >
                <div>
                  <div className="font-medium">{bill.name}</div>
                  <div className="text-sm text-slate-500">
                    {formatCurrency(bill.amount)} • Due on day {bill.dueDay}
                  </div>
                </div>

                <Button
                  variant={bill.paid ? "default" : "outline"}
                  onClick={() => toggleBillPaid(bill.id)}
                >
                  {bill.paid ? "Paid" : "Mark Paid"}
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm">
          <CardHeader>
            <CardTitle>Financial Health Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-slate-700">
            <p>• Emergency Fund: {formatCurrency(emergencyFund)}</p>
            <p>• Total Planned Budget: {formatCurrency(totalBudget)}</p>
            <p>• Debt-to-Income Ratio: {debtRatio.toFixed(1)}%</p>
            <p>
              • Recommendation: Focus on clearing the personal loan first after
              maintaining your emergency fund.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
