"use client";

import { useEffect, useState } from 'react';
import styles from './page.module.css'

export default function Home() {
  const [categoryWiseMonthExpense, setCategoryWiseMonthExpense] = useState({
    "Food": 0,
    "Transport": 0,
    "Rent": 0,
    "Entertainment": 0,
    "Other": 0
  });
  const [isAddVisible, setAddVisible] = useState(false);
  const toggleAddExpense = () => {
    setAddVisible(!isAddVisible);
  }
  const expenseCategory = [
    "Food", "Transport", "Rent", "Entertainment", "Other"
  ];
  const [expenses, setExpenses] = useState([
    { id: 1, date: '2024-01-15', description: 'Lunch at cafe', category: 'Food', amount: 450 },
    { id: 2, date: '2024-01-14', description: 'Taxi to office', category: 'Transport', amount: 200 },
    { id: 3, date: '2024-01-13', description: 'Monthly rent', category: 'Rent', amount: 15000 },
    { id: 4, date: '2024-01-12', description: 'Movie tickets', category: 'Entertainment', amount: 600 },
    { id: 5, date: '2024-01-11', description: 'Grocery shopping', category: 'Other', amount: 2500 },
    { id: 6, date: '2024-01-10', description: 'Takeout', category: 'Food', amount: 1200 }
  ]);

  const formatDate = (dateString) => {
    const [year, month, day] = dateString.split('-');
    return `${day}-${month}-${year}`;
  };

  const addExpense = () => {
    const date = document.getElementById('date').value;
    const description = document.getElementById('description').value;
    const category = document.getElementById('category').value;
    const amount = document.getElementById('amount').value;

    if (date && description && category && amount) {
      const newExpense = {
        id: expenses.length + 1,
        date,
        description,
        category,
        amount: parseFloat(amount)
      };
      //LOGIC TO ADD TO DB : TO DO
      setExpenses([newExpense, ...expenses]);
      // Clear input fields after adding expense
      document.getElementById('date').value = new Date().toISOString().split('T')[0];
      document.getElementById('description').value = '';
      document.getElementById('category').value = '';
      document.getElementById('amount').value = '';
      setAddVisible(false);
      document.getElementById('warning').style.display = 'none';
    } else {
      document.getElementById('warning').style.display = 'block';
    }
  }

  useEffect(() => {
    // populate expense category in dropdown instead of hardcoding
    const categorySelect = document.getElementById('category');
    categorySelect.innerHTML = '<option value="" disabled>Category</option>';
    expenseCategory.forEach(cat => {
      const option = document.createElement('option');
      option.value = cat;
      option.textContent = cat;
      categorySelect.appendChild(option);
    });
    fetch('http://localhost:3000/api/expenses?type=monthByCategory', {
      method: 'GET'
    })
      .then(response => response.json())
      .then(data => console.log(data))
      .catch(error => console.error('Error fetching category-wise month expense:', error));
  }, [])

  return (
    <div className={styles.bodycontainer}>
      <p className={`${styles.title} ${styles.whiteheaders} ${styles.maintitle}`}>Expense Tracker</p>
      <div className={styles.expshowwrapper}>
        <p className={styles.expshowhead}>Today's spend: </p>
        <p className={styles.expshowval}>Rs {120000}/-</p>
      </div>
      <div className={styles.expshowwrapper}>
        <p className={styles.expshowhead}>This month: </p>
        <p className={styles.expshowval}>Rs {120000}/-</p>
      </div>
      <p className={styles.monthlyinsighthead}>This Month's Insight:</p>
    
      <div className={styles.monthlyinsightcontainer}>
        {
          Object.keys(categoryWiseMonthExpense).map((cat) => (
            <div key={cat} className={styles.wrapper}>
              <div className={styles.monthlyinsightcard} style={{color: cat==="Food"?"rgb(107, 255, 102)"
                    :cat==="Transport"?"rgb(255, 255, 102)"
                    :cat==="Rent"?"rgb(255, 102, 102)"
                    :cat==="Entertainment"?"rgb(102, 255, 255)"
                   :"rgb(183, 183, 183)"}}>
              <div className={styles.wrapperspacebtw}>
                <p className={styles.monthlyinsightcategory}>{cat}</p>
                <p className={styles.monthlyinsightamount}>Rs {categoryWiseMonthExpense[cat]}/-</p>
              </div>
            </div>
            </div>
          ))
        }
      </div>
      <div className={styles.wrapper}>
        <button className={styles.addexpbtn} onClick={toggleAddExpense}>
          <p className={styles.btntext}>{isAddVisible ? "Cancel" : "Add Expense"}</p>
        </button>
      </div>
      <div className={styles.wrapper}>
        <div className={styles.expensedesccontainer} style={{height : isAddVisible ? "auto" : "0px", display: isAddVisible ? "block" : "none" }}>
          <div className={styles.wrapperspacebtw}>
            <p className={styles.datepickerhead}>Date: </p>
            <input id="date" type="date" defaultValue={new Date().toISOString().split('T')[0]} className={styles.datepicker} />
          </div>
          <textarea id="description" rows={4} placeholder="Description" className={styles.expensedesc} />
          <div className={styles.wrapperspacebtw}>
            <p className={styles.datepickerhead}>Category: </p>
            <select id="category" className={styles.categoryselect} defaultValue="">
              <option value="" disabled >Category</option>
            </select>
          </div>
          <div className={styles.wrapperspacebtw}>
            <p className={styles.datepickerhead}>Amount: </p>
            <input id="amount" type="number" placeholder="In Rs." className={styles.amount} /> 
          </div>
          <p id="warning" className={styles.warningtext}>All fields must have valid values.</p>
          <div className={styles.addbtnwrapper}>
            <button className={styles.addbtn} onClick={addExpense}>
              <p className={styles.addbtntext}>Add</p>
            </button>
          </div>
        </div>
      </div>
      <p className={styles.explisthead}>Last 10 Expenses:</p>
      {
        expenses.map((expense) => (
          <div key={expense.id} className={styles.wrapper}>
            <div  className={styles.expensedetailcard}>
              <div className={styles.wrapperspacebtw}>
                <p className={styles.expdetailsdesc}>{expense.description}</p>
                <p className={styles.expdetailsdesc}>Rs {expense.amount}/-</p>
              </div>
              <div className={styles.wrapperspacebtw}>
                <p className={styles.expdetailsdesc}>{formatDate(expense.date)}</p>
                <p className={styles.expdetailscategory}
                   style={{backgroundColor: expense.category==="Food"?"rgb(107, 255, 102)"
                    :expense.category==="Transport"?"rgb(255, 255, 102)"
                    :expense.category==="Rent"?"rgb(255, 102, 102)"
                    :expense.category==="Entertainment"?"rgb(102, 255, 255)"
                   :"rgb(183, 183, 183)"}}>
                  {expense.category}
                </p>
                
              </div>
          </div>
          </div>
        ))
      }
    </div>
  );
}
