let budgetController = (function () {
    let Expense = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    Expense.prototype.calcPercentage = function (totalIncome) {
        if (totalIncome > 0) {
            this.percentage = Math.round(this.value / totalIncome * 100);
        }
        else {
            this.percentage = -1;
        }
    }

    Expense.prototype.getPercentage = function () {
        return this.percentage;
    }

    let income = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };
    var calculateTotal = function(type) {
            let sum = 0;
            data.allItems[type].forEach((c) => {
                sum += c.value;
            })
            data.totals[type] = sum;
    }

    let data = {
        allItems: {
            exp: [],
            inc:[]
        },
        totals: {
            exp: 0,
            inc: 0,
        },
        budget : 0,
        percentage : -1,
    };

    return {
        addItem: function(type,description,value) {
            var id, newItem;
            if (data.allItems[type].length > 0) {
                id = data.allItems[type][data.allItems[type].length - 1].id + 1;                
            }
            else {
                id = 0;
            }
            if (type === 'exp') {
                newItem = new Expense(id, description, value);
            }
            else if (type === 'inc') {
                newItem = new income(id,description,value)
            }
            data.allItems[type].push(newItem);
            return newItem;
        },
        deleteItems: function (type, id) {
            var ids,index;
            ids = data.allItems[type].map(c => {
                return c.id;
            })
            index = ids.indexOf(id);
            if (index !== -1) {
                data.allItems[type].splice(index, 1);
            }
            // console.log(data.allItems[type]);
        },

        // Total income and expenses
        calculateBudget: function() {
        
            // 1.Total income and expense
            calculateTotal('exp');
            calculateTotal('inc');

            // 2.calculation total income - expense
            data.budget = data.totals.inc - data.totals.exp;

            // 3.calculation of percentage
            if (data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);  
            }
        },
        calculatePercentage: function () {
            let calc = data.allItems.exp.forEach(c => {
                c.calcPercentage(data.totals.inc);
            });
        },
        getPercentage: function () {
            var allPercentage;
            allPercentage = data.allItems.exp.map(c => {
                return c.getPercentage();
            })
            return allPercentage;
        },
        getBudget: function(){
            return {
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                budget: data.budget,
                percentage: data.percentage,
            }
        }
    }
})();

let UIController = (function () {

    let DOMStrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputbtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        incomeLabel: '.budget__income--value',
        expenseLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        budgetLabel: '.budget__value',
        container: '.container',
        deleteItem: '.item__delete--btn',
        expensePerLabel: '.item__percentage',
        presentDate: '.budget__title--month',
    }

    let formatNumber = function(num, type) { 
        let split;
        fix = num.toFixed(2);
        split = fix.split('.');
        int = split[0];
        dec = split[1];
        if (int.length > 3) {
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
        }
        num = int + '.' + dec;
        
        return (type === 'exp' ? '-' : '+')+' ' + int + '.' + dec;
    };
    let fields = document.querySelectorAll(DOMStrings.expensePerLabel);
    var nodelist = function (list, callback) {
        for (let i = 0; i < list.length; i++) {
                callback(list[i], i);
            }
        }
    
    return {
        input: function () {
            return {
                type: document.querySelector(DOMStrings.inputType).value,
                description: document.querySelector(DOMStrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMStrings.inputValue).value),
            };
        },
        getDOMStrings: function () {
            return DOMStrings;
            
        },
        addListItem: function (obj, type) {
            var html, newHtml, element;
            // Create HTML string with placeholder text
            if (type === 'inc') {
                element = DOMStrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description" > %description% </div > <div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div > ';
            }
            else if (type === 'exp') {
                element = DOMStrings.expensesContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }
            //replace html with actual data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

            //insert html into DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
            
        },
        clearFields: function () {
            var fields;
            fields = document.querySelectorAll(DOMStrings.inputDescription + ',' + DOMStrings.inputValue);
            ArrFields = Array.prototype.slice.call(fields);
            ArrFields.forEach(function (current, index, array) {
                current.value = '';
            });
            ArrFields[0].focus();
        },
        displayBudget: function (obj) {
            obj.budget > 0 ? type = 'inc' : type = 'exp';
            document.querySelector(DOMStrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMStrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMStrings.expenseLabel).textContent = formatNumber(obj.totalExp, 'exp');
            if (obj.percentage >= 0) {
                document.querySelector(DOMStrings.percentageLabel).textContent = obj.percentage + '%';
            }
            else {
                document.querySelector(DOMStrings.percentageLabel).textContent = '---';
            }
        },
        deletelistItem: function (seletedItem) {
            let removeItem;
            removeItem = document.getElementById(seletedItem);
            removeItem.parentNode.removeChild(removeItem);
        },
        displayPercentage: function (percentage) {
            let fields = document.querySelectorAll(DOMStrings.expensePerLabel);
            
            nodelist(fields, function (current, index) {
                if (percentage[index] > 0) {
                    current.textContent = percentage[index] + '%';
                }
                else {
                    current.textContent = '---';
                }
            })
        },
        displayDate: function () {
            let date, year, month;
            date = new Date();
            year = date.getFullYear();
            month = date.getMonth();
            months = ['Janaury','February','March','April','May','June','July','August','September','Octuber','November','Dec']
            document.querySelector(DOMStrings.presentDate).textContent = months[month] +' '+ year;
        },
           
        changedType: function() {
            
            var fields = document.querySelectorAll(
                DOMStrings.inputType + ',' +
                DOMStrings.inputDescription + ',' +
                DOMStrings.inputValue);
            
            nodelist(fields, function(cur) {
               cur.classList.toggle('red-focus'); 
            });
            
            document.querySelector(DOMStrings.inputbtn).classList.toggle('red');
            
        },

    };
    
})();

let Controller = (function (budgetCtrl, UICtrl) {
    
    updateBudget = function () {
        // 1.Total budget calculation
        budgetCtrl.calculateBudget();

        // 2.return budget
        var budget = budgetCtrl.getBudget();

        // 3.update UI
        UICtrl.displayBudget(budget);
    }
        
    let updatePercentage = function () {
        
        // 1.calculate percentage
        budgetCtrl.calculatePercentage();

        // 2.read percentage from budget controller
        let percentage = budgetCtrl.getPercentage();

        // 3.update percentage in UI from new percentage
        UICtrl.displayPercentage(percentage);
    };
    let ctrlAdd = function () {
        // 1: get the fied input data
        let input = UICtrl.input();

        if (input.description !== '' && !isNaN(input.value) && input.value > 0) {
        
        //2. add item to budget controller
        let items = budgetCtrl.addItem(input.type, input.description, input.value);
        
        // 3. update UI
        UICtrl.addListItem(items, input.type);

        // 4.clear the fields
        UICtrl.clearFields();
        
        // 5.budget controller
            updateBudget();
            
        // 6.delete and update percentage
            updatePercentage();    
        }
        
    };

    var ctrlDeleteItem = function (event) {

        var itemId, splitId;
        itemId = event.target.parentNode.parentNode.parentNode.parentNode.id;

        if (itemId) {
            splitId = itemId.split('-');
            type = splitId[0];
            id = parseInt(splitId[1]);

            // 1.delete item from data structure
            budgetCtrl.deleteItems(type, id);
            
            // 2.delete from the UI
            UICtrl.deletelistItem(itemId);

            // 3.update the budget
            updateBudget();

            // 4.delete and update percentage
            updatePercentage();
        }
    }

    var setupEventListener = function () {
        var DOM = UICtrl.getDOMStrings();
        document.querySelector(DOM.inputbtn).addEventListener('click', ctrlAdd);
        document.addEventListener('keypress', function (event) {
            if (event.keyCode === 13) {
                ctrlAdd();
            }
        });
        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);
    }
    
    return {
        init: function () {
            UICtrl.displayDate();
            setupEventListener();
            // UICtrl.displayBudget({
            //     budget: 0,
            //     totalExp: 0,
            //     totalInc: 0,
            //     percentage:-1,
            // })
        }
    };
})(budgetController, UIController);

Controller.init();