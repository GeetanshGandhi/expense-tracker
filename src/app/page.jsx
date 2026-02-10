"use client";

import { useEffect, useState } from 'react';
import Image from 'next/image';
import styles from './page.module.css'

export default function Home() {
  const [todaysExpense, setTodaysExpense] = useState(0);
  const [monthsExpense, setMonthsExpense] = useState(0);
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
    "Food", "Groceries", "Transport", "Rent", "Entertainment", "Other"
  ];
  const [expenses, setExpenses] = useState([]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const addExpense = async () => {
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
      const res = await fetch('/api/expenses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newExpense)
      })
      if(res.ok){
      const data = await res.json();
      setExpenses([data, ...expenses]);
      // Clear input fields after adding expense
      document.getElementById('date').value = new Date().toISOString().split('T')[0];
      document.getElementById('description').value = '';
      document.getElementById('category').value = '';
      document.getElementById('amount').value = '';
      setAddVisible(false);
      document.getElementById('warning').style.display = 'none';
      }

    } else {
      document.getElementById('warning').style.display = 'block';
    }
  }

  const prelimDeleteExpense = (expenseId) => {
      document.getElementById(`confirmdeletewrapper-${expenseId}`).style.display = 'flex';
      document.getElementById(`deleteiconbtn-${expenseId}`).style.display = 'none';
      document.getElementById(`canceldeletion-${expenseId}`).style.display = 'block';}

  const cancelDeleteExpense = (expenseId) => {
    document.getElementById(`confirmdeletewrapper-${expenseId}`).style.display = 'none';
    document.getElementById(`deleteiconbtn-${expenseId}`).style.display = 'block';
    document.getElementById(`canceldeletion-${expenseId}`).style.display = 'none';
  }

  const deleteExpense = async (id) => {
    //LOGIC TO DELETE FROM DB : TO DO
    const res = await fetch(`/api/expenses?id=${id}`, {
      method: 'DELETE'
    });
    if(res.ok){
      setExpenses(expenses.filter(exp => exp.id !== id));
    }
  }

  useEffect(async () => {
          // populate expense category in dropdown instead of hardcoding
    const categorySelect = document.getElementById('category');
    categorySelect.innerHTML = '<option value="" disabled>Category</option>';
    expenseCategory.forEach(cat => {
      const option = document.createElement('option');
      option.value = cat;
      option.textContent = cat;
      categorySelect.appendChild(option);
    });
    await fetch('/api/expenses?type=monthByCategory', {
      method: 'GET'
    })
      .then(response => response.json())
      .then(data => setCategoryWiseMonthExpense(data))
      .catch(error => console.error('Error fetching category-wise month expense:', error));
    
      // last 10 expenses
      await fetch('/api/expenses?type=last10', {
      method: 'GET'
    })
      .then(response => response.json())
      .then(data => setExpenses(data))
      .catch(error => console.error('Error fetching last 10 expenses:', error));

    //fetch todays total expense
    await fetch('/api/expenses?type=todayTotal', {
      method: 'GET'
    })
      .then(response => response.json())
      .then(data => setTodaysExpense(data.total))
      .catch(error => console.error('Error fetching today total expense:', error));

    //fetch month total expense
    await fetch('/api/expenses?type=monthTotal', {
      method: 'GET'
    })
      .then(response => response.json())
      .then(data => setMonthsExpense(data.total))
      .catch(error => console.error('Error fetching month total expense:', error));

  }, [])

  return (
    <div className={styles.bodycontainer}>
      <p className={`${styles.title} ${styles.whiteheaders} ${styles.maintitle}`}>Expense Tracker</p>
      <div className={styles.expshowwrapper}>
        <p className={styles.expshowhead}>Today's spend: </p>
        <p className={styles.expshowval}>Rs {todaysExpense}/-</p>
      </div>
      <div className={styles.expshowwrapper}>
        <p className={styles.expshowhead}>This month: </p>
        <p className={styles.expshowval}>Rs {monthsExpense}/-</p>
      </div>
      <p className={styles.monthlyinsighthead}>This Month's Insight:</p>
    
      <div className={styles.monthlyinsightcontainer}>
        {
          Object.keys(categoryWiseMonthExpense).map((cat) => (
            <div key={cat} className={styles.wrapper}>
              <div className={styles.monthlyinsightcard} style={{color: cat==="Food"?"rgb(107, 255, 102)"
                    :cat==="Groceries"?"rgb(209, 188, 255)"
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
                <p className={styles.expdetailscategory}
                   style={{backgroundColor: expense.category==="Food"?"rgb(107, 255, 102)"
                    :expense.category==="Groceries"?"rgb(209, 188, 255)"
                    :expense.category==="Transport"?"rgb(255, 255, 102)"
                    :expense.category==="Rent"?"rgb(255, 102, 102)"
                    :expense.category==="Entertainment"?"rgb(102, 255, 255)"
                   :"rgb(183, 183, 183)"}}>
                  {expense.category}
                </p>
                <p className={styles.expdetailsdesc}>{formatDate(expense.date)}</p>
                <button id={"deleteiconbtn-"+expense.id} className={styles.deletebtn} onClick={()=>prelimDeleteExpense(expense.id)}>
                    <Image className={styles.deleteimg} src={require("../images/deleteIcon.png")} alt="Delete expense" />
                </button>
                <button id={"canceldeletion-"+expense.id} className={styles.canceldeletion} onClick={()=>cancelDeleteExpense(expense.id)}>Cancel</button>
              </div>
              <div id={"confirmdeletewrapper-"+expense.id} className={styles.confirmdeletewrapper}>
                <p className={styles.confirmdeletetext}>Confirm Delete?</p>
                <button className={styles.confirmdeleteyes} onClick={()=>deleteExpense(expense.id)}>Yes</button>
              </div>
          </div>
          </div>
        ))
      }
    </div>
  );
}
