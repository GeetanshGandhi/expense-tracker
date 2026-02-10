import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

/**
 * GET
 * - last 10 expenses
 * - total expenditure of today
 * - total expenditure of current month
 * - monthly total grouped by category
 *
 * Query params:
 * ?type=last10
 * ?type=todayTotal
 * ?type=monthTotal
 * ?type=monthByCategory
 */
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");

  try {
    // 1️⃣ GET last 10 expenses
    if (type === "last10") {
      const expenses = await prisma.expense.findMany({
        orderBy: { date: "desc" },
        take: 10,
      });
      return NextResponse.json(expenses);
    }

    // Date helpers
    const now = new Date();

    // 2️⃣ GET total expenditure of current day
    if (type === "todayTotal") {
      const startOfDay = new Date(now.setHours(0, 0, 0, 0));
      const endOfDay = new Date(now.setHours(23, 59, 59, 999));

      const result = await prisma.expense.aggregate({
        _sum: { amount: true },
        where: {
          date: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
      });
      return NextResponse.json({
        total: result._sum.amount || 0,
      });
    }

    // 3️⃣ GET total expenditure of current month
    if (type === "monthTotal") {
      const startOfMonth = new Date(
        now.getFullYear(),
        now.getMonth(),
        1
      );
      const endOfMonth = new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        0,
        23,
        59,
        59,
        999
      );

      const result = await prisma.expense.aggregate({
        _sum: { amount: true },
        where: {
          date: {
            gte: startOfMonth,
            lte: endOfMonth,
          },
        },
      });

      return NextResponse.json({
        total: result._sum.amount || 0,
      });
    }

    // 4️⃣ GET monthly expenditure grouped by category
    if (type === "monthByCategory") {
      const startOfMonth = new Date(
        now.getFullYear(),
        now.getMonth(),
        1
      );
      const endOfMonth = new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        0,
        23,
        59,
        59,
        999
      );

      const grouped = await prisma.expense.groupBy({
        by: ["category"],
        _sum: {
          amount: true,
        },
        where: {
          date: {
            gte: startOfMonth,
            lte: endOfMonth,
          },
        },
      });

    const result = grouped.reduce((acc, item) => {
      acc[item.category] = item._sum.amount || 0;
      return acc;
    }, {});
      return NextResponse.json(result);
    }

    return NextResponse.json(
      { error: "Invalid type parameter" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error in GET /api/expenses:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST
 * - Add an expense
 *
 * Body:
 * {
 *   "date": "2026-02-08",
 *   "description": "Lunch",
 *   "category": "Food",
 *   "amount": 250
 * }
 */
export async function POST(req) {
  try {
    const body = await req.json();

    const expense = await prisma.expense.create({
      data: {
        date: new Date(body.date),
        description: body.description,
        category: body.category,
        amount: body.amount,
      },
    });

    return NextResponse.json(expense, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE
 * - Delete an expense by ID
 *
 * Query param:
 * ?id=5
 */
export async function DELETE(req) {
  const { searchParams } = new URL(req.url);
  const id = Number(searchParams.get("id"));

  if (!id) {
    return NextResponse.json(
      { error: "Expense ID is required" },
      { status: 400 }
    );
  }

  try {
    await prisma.expense.delete({
      where: { id },
    });

    return NextResponse.json({
      message: "Expense deleted successfully",
    });
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
