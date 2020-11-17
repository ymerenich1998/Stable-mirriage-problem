(function () {

//Визначаю глобальний простір імен
var GS;
if (typeof GS === "undefined") {
  GS = {};
} else if (typeof GS !== "object") {
  throw new Error("GS вже існує, але не є об'єктом.");
} else {
  throw new Error("GS вже існує як об'єкт.");
}

//Налаштування прототипного успадкування
Object.prototype.beget = function () {
  function F() {}
  F.prototype = this;
  return new F();
};

Object.prototype.create = function (data) {
  // створюю новий об'єкт на цьому об'єкті
  function F() {}
  F.prototype = this;
  copy = new F();

  // перебираю властивості об'єкта даних, який маю
   // та передаю в цю функцію
  for (var property in data) {
    if (data.hasOwnProperty(property)) {
      // переконаємось, що цей об’єкт визначає поточну властивість
      if (this.hasOwnProperty(property)) {
        // присвоєння поточного значення властивості новому наборові
        copy[property] = data[property];
      }
    }
  }

  return copy;
};

GS.TypeA = {
  name: undefined,
  ranking: [],
  matchedTo: undefined,
  highestTypeB: 0,
  toString: function () {return this.name;}
};

GS.TypeB = {
  name: undefined,
  ranking: [],
  matchedTo: undefined,
  toString: function () {return this.name;}
};

GS.globals = {
};

GS.lineNumber = 1;

GS.print = function (str, parent) {
  var textElem = document.createElement('p');
  textElem.appendChild(document.createTextNode(GS.lineNumber++ + ': ' + str));
  parent.appendChild(textElem);
};

/**
 * Вивожу результат сполучень
 */
GS.printPairs = function (typeAs, typeBs, parent) {
  for (var a = 0; a < typeAs.length; a++) {
    GS.print(typeAs[a].name + ' в парі з ' + typeBs[typeAs[a].matchedTo].name, parent);
  }
}

/**
 * Повертаю кількість самотніх типівА.
 */
GS.totalUnmatched = function (typeAs) {
  var result = 0;
  for (var a = 0; a < typeAs.length; a++) {
    if (typeAs[a].matchedTo == undefined) {
      result += 1;
    }
  }
  return result;
};

/**
 * Алгоритм Гейла-Шеплі для стабільного узгодження.
 */
GS.match = function (typeAs, typeBs, verbose) {
  var round = 1;
  var verboseResults = document.getElementById('verbose_results');
  while (GS.totalUnmatched(typeAs) > 0 && round <= 50) {
    var result = '';
    if (verbose) GS.print('Дія ' + round, verboseResults);
    for (var a = 0; a < typeAs.length; a++) {
      (function () {
        var A = typeAs[a];
        if (typeAs[a].matchedTo === undefined) {
          // вибираємо найвищий типB, який A не пропонував
          var b = typeAs[a].ranking[typeAs[a].highestTypeB];
          var B = typeBs[b];
          if (verbose) GS.print(A + ' віддає перевагу ' + B, verboseResults);
          // якщо b не має збігу, тоді пару a і b
          if (typeBs[b].matchedTo === undefined) {
            if (verbose) GS.print(B + ' не має собі рівних ', verboseResults);
            typeAs[a].matchedTo = b;
            typeBs[b].matchedTo = a;
            if (verbose) GS.print(A + ' стає в парі з ' + B, verboseResults);
          }
          // якщо b вже в парі з a, тоді нічого не робити
          else if (typeBs[b].matchedTo == a) {
            // нічого не робити
            if (verbose) GS.print(B + ' вже відповідає ' + A, verboseResults);
          }
          // інакше b вже є парним, але це не для a
          else {
            var a_ = typeBs[b].matchedTo;
            var A_ = typeAs[a_];
            if (verbose) GS.print(B + ' вже в парі з ' + A_, verboseResults);
            if (verbose) GS.print(B + ' пріоритет ' + A_ + ' як ' + typeBs[b].ranking.indexOf(a_), verboseResults);
            if (verbose) GS.print(B + ' пріоритет ' + A + ' як ' + typeBs[b].ranking.indexOf(a), verboseResults);
            // якщо поточна пара b (a_) стоїть на b вище, ніж a, тоді a слід шукати іншу пару
            if (typeBs[b].ranking.indexOf(a_) < typeBs[b].ranking.indexOf(a)) {
              // більше не запитувати цей тип B.
              typeAs[a].highestTypeB++;
              if (verbose) GS.print(A + ' переходить до ' + typeBs[typeAs[a].ranking[typeAs[a].highestTypeB]], verboseResults);
            }
            // в іншому випадку, пару a з b, а a_ слід поєднати з кимось іншим
            else {
              typeAs[a].matchedTo = b;
              typeBs[b].matchedTo = a;
              typeAs[a_].matchedTo = undefined;
              if (verbose) GS.print(A + ' стає в парі з ' + B, verboseResults);
              if (verbose) GS.print(A_ + ' стає самотнім', verboseResults);
              typeAs[a_].highestTypeB++;
              if (verbose) GS.print(A_ + ' переходить до ' + typeBs[typeAs[a_].ranking[typeAs[a_].highestTypeB]], verboseResults);
            }
          }
        }
      }());
    }
    round++;
  }
};

// Генерую html-структуру
GS.Dom = {
  match: function () {
    var results = document.getElementById('results');
    if (results) results.parentNode.removeChild(results);
    var verboseResults = document.getElementById('verbose_results');
    if (verboseResults) verboseResults.parentNode.removeChild(verboseResults);
    var typeAs = [];
    var typeBs = [];
    var boySelects;
    var girlSelects;
    var boyName;
    var girlName;
    var n = GS.globals.n;
    var typeA = GS.globals.typeA;
    var typeB = GS.globals.typeB;
    for (var i = 0; i < n; i++) {
      boySelects = GS.Dom.getElementsByClassName(typeA + '_rank', document.getElementById(typeA + '_' + i));
      var ranking = [];
      for (var j = 0; j < boySelects.length; j++) {
        if (boySelects[j].selectedIndex != '-1') {
         ranking.push(boySelects[j].selectedIndex);
       }
      }
      boyName = document.getElementById(typeA + '_name_' + i).value;
      typeAs.push(GS.TypeA.create({ranking: ranking, name: boyName}));
      girlSelects = GS.Dom.getElementsByClassName(typeB + '_rank', document.getElementById(typeB + '_' + i));
      var ranking = [];
      for (var j = 0; j < girlSelects.length; j++) {
        if (girlSelects[j].selectedIndex != '-1') {
          ranking.push(girlSelects[j].selectedIndex);
        }
      }
      girlName = document.getElementById(typeB + '_name_' + i).value;
      typeBs.push(GS.TypeB.create({ranking: ranking, name: girlName}));
    }
    if (document.getElementById('verbose').checked) {
      var verboseResults = document.createElement('div');
      verboseResults.setAttribute('id', 'verbose_results');
      var verboseResultsHeader = document.createElement('h2');
      verboseResultsHeader.setAttribute('id', 'verbose_results_header');
      verboseResultsHeader.appendChild(document.createTextNode('Опис результату'));
      verboseResults.appendChild(verboseResultsHeader);
      document.getElementById('generated').appendChild(verboseResults);
      GS.match(typeAs, typeBs, true);
    } else {
      GS.match(typeAs, typeBs, false);
    }
    var results = document.createElement('div');
    results.setAttribute('id', 'results');
    var resultsHeader = document.createElement('h2');
    resultsHeader.setAttribute('id', 'results_header');
    resultsHeader.appendChild(document.createTextNode('Результат'));
    results.appendChild(resultsHeader);
    document.getElementById('generated').appendChild(results);
    GS.printPairs(typeAs, typeBs, results);
  },
  setup: function () {
    var n = document.getElementById('n').value;
    GS.globals.n = n;

    var typeA = document.getElementById('type_a').value.replace(/ /g, '_');
    var typeB = document.getElementById('type_b').value.replace(/ /g, '_');
    GS.globals.typeA = typeA;
    GS.globals.typeB = typeB;
    if (typeA.length == 0 || typeB.length == 0) {
      window.alert('Ви повинні ввести два імена типів');
      return;
    } else if (typeA == typeB) {
      window.alert('Два типи (' + typeA + ', ' + typeB + ') повинні бути різними');
      return;
    }

    var setup = document.getElementById('setup');
    setup.removeEventListener('click', GS.Dom.setup, false);
    setup.firstChild.data = 'Скинути';
    setup.addEventListener('click', GS.Dom.reset, false);

    var generated = document.createElement('div');
    generated.setAttribute('id', 'generated');
    var typeAs = document.createElement('div');
    typeAs.setAttribute('id', typeA + 's');
    typeAs.setAttribute('class', 'type_list mb-3');
    var typeAsHeader = document.createElement('h2');
    typeAsHeader.appendChild(document.createTextNode(typeA));
    typeAsHeader.setAttribute('class', 'gender-title typeA');
    typeAs.appendChild(typeAsHeader);
    var typeBs = document.createElement('div');
    typeBs.setAttribute('id', typeB + 's');
    typeBs.setAttribute('class', 'type_list mb-3');
    var typeBsHeader = document.createElement('h2');
    typeBsHeader.appendChild(document.createTextNode(typeB));
    typeBsHeader.setAttribute('class', 'gender-title typeB');
    typeBs.appendChild(typeBsHeader);
    for (var i = 0; i < n; i++) {
      GS.Dom.input(typeAs, i, true);
      GS.Dom.input(typeBs, i, false);
    }
    var matchControls = document.createElement('div');
    matchControls.setAttribute('id', 'match_controls');
    var match = document.createElement('button');
    match.setAttribute('id', 'match')
    match.setAttribute('class', 'btn btn-function my-2')
    match.appendChild(document.createTextNode('Вирішити'));
    match.addEventListener('click', GS.Dom.match, false);
    var verbose_block = document.createElement('div');
    verbose_block.setAttribute('class', 'verbose_block d-block');
    var verbose = document.createElement('input');
    verbose.setAttribute('type', 'checkbox');
    verbose.setAttribute('id', 'verbose');
    verbose.setAttribute('class', 'mr-2');
    var verboseLabel = document.createElement('label');
    verboseLabel.setAttribute('htmlFor', '#verbose');
    verboseLabel.appendChild(document.createTextNode('Детальний опис?'));
    matchControls.appendChild(verbose_block);
    verbose_block.appendChild(verbose);
    verbose_block.appendChild(verboseLabel);
    matchControls.appendChild(match);
    generated.appendChild(typeAs);
    generated.appendChild(typeBs);
    generated.appendChild(matchControls);
    document.getElementById('stable-mirriage-container').appendChild(generated);
  },
  reset: function () {
    if (window.confirm('Ви впевненні?')) {
      var generated = document.getElementById('generated');
      generated.parentNode.removeChild(generated);
      var setup = document.getElementById('setup');
      setup.removeEventListener('click', GS.Dom.reset, false);
      setup.firstChild.data = 'Створити';
      setup.addEventListener('click', GS.Dom.setup, false);
    }
  },
  last: function (e) {
    var typeA = GS.globals.typeA;
    if (this.getAttribute('id').match(typeA)) {
      GS.globals.lastTypeA = this.selectedIndex;
    } else {
      GS.globals.lastTypeB = this.selectedIndex;
    }
  },
  update: function (e) {
    var typeA = GS.globals.typeA;
    var typeB = GS.globals.typeB;
    var toValue = this.selectedIndex;
    var id = this.getAttribute('id');
    var rank;
    var postfix;
    var selectsClass;
    var last;
    var selects;
    if (id.match(typeA)) {
      last = GS.globals.lastTypeA;
      postfix = '_rank_';
      selectClass = typeA + '_rank';
    } else {
      last = GS.globals.lastTypeB;
      postfix = '_rank_';
      selectClass = typeB + '_rank';
    }
    rank = id.slice(id.search(postfix) + postfix.length, id.length);
    selects = GS.Dom.getElementsByClassName(selectClass, this.parentNode);
    for (var i = 0; i < selects.length; i++) {
      if (rank != i && selects[i].selectedIndex == toValue) {
        selects[i].selectedIndex = last;
      }
    }
  },
  updateName: function (e) {
    var typeA = GS.globals.typeA;
    var typeB = GS.globals.typeB;
    var toValue = this.value;
    var id = this.getAttribute('id');
    var number;
    var selects;
    var selectClass;
    var prefix;
    if (id.match(typeA)) {
      prefix = typeA + '_name_';
      selectClass = typeB + '_rank';
    } else {
      prefix = typeB + '_name_';
      selectClass = typeA + '_rank';
    }
    number = id.replace(prefix, '');
    selects = GS.Dom.getElementsByClassName(selectClass);
    for (var i = 0; i < selects.length; i++) {
      selects[i].options[number].text = toValue;
    }
  },
  input: function (parent, number, isTypeA) {
    var n = GS.globals.n;
    var typeA = GS.globals.typeA;
    var typeB = GS.globals.typeB;
    var type = document.createElement('div');
    type.setAttribute('className', 'type');
    isTypeA ? type.setAttribute('id', typeA + '_' + number) : type.setAttribute('id', typeB + '_' + number);
    var name = document.createElement('input');
    name.setAttribute('type', 'text');
    isTypeA ? name.setAttribute('id', typeA + '_name_' + number) : name.setAttribute('id', typeB + '_name_' + number);
    isTypeA ? name.setAttribute('value', typeA + number) : name.setAttribute('value', typeB + number);
    name.addEventListener('change', GS.Dom.updateName, false);
    type.appendChild(name);
    for (var rank = 0; rank < n; rank++) {
      var select = document.createElement('select');
      var option = document.createElement('option');
      option.setAttribute('value',  "-1");
      option.text = "";
      select.add(option, undefined);
      for (var choice = 0; choice < n; choice++) {
        var option = document.createElement('option');
        option.setAttribute('value', choice);
        isTypeA ? option.text = typeB + choice : option.text = typeA + choice;
        select.add(option, undefined);
      }
      number + rank >= n ? select.selectedIndex = number + rank - n : select.selectedIndex = number + rank;
      isTypeA ? select.setAttribute('id', typeA + number + '_rank_' + rank) : select.setAttribute('id', typeB + '_' + number + '_rank_' + rank);
      isTypeA ? select.setAttribute('class', typeA + '_rank ' + typeA + '_rank_' + rank) : select.setAttribute('class', typeB + '_rank ' + typeB + '_rank_' + rank);
      select.addEventListener('change', GS.Dom.update, false);
      select.addEventListener('focus', GS.Dom.last, false);
      type.appendChild(select);
    }
    parent.appendChild(type);
  },
  getElementsByClassName: function (className, node, tag) {
    if ( node == undefined ) {
      node = document;
    }
    if (node.getElementsByClassName) {
      return node.getElementsByClassName(className);
    }
    else {
      var classElements = new Array();
      if ( tag == undefined ) {
        tag = '*';
      }
      var els = node.getElementsByTagName(tag);
      var elsLen = els.length;
      var pattern = new RegExp('(^|\\s)' + className + '(\\s|$)');
      for (var i = 0, j = 0; i < elsLen; i++) {
        if (pattern.test(els[i].className)) {
          classElements[j] = els[i];
          j++;
        }
      }
      return classElements;
    }
  }
};

window.onload = function () {
  var setup = document.getElementById('setup');
  setup.addEventListener('click', GS.Dom.setup, false);
};

})();
