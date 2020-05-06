// categories is the main data structure for the app; it looks like this:

//  [
//    { title: "Math",
//      clues: [
//        {question: "2+2", answer: 4, showing: null},
//        {question: "1+1", answer: 2, showing: null}
//        ...
//      ],
//    },
//    { title: "Literature",
//      clues: [
//        {question: "Hamlet Author", answer: "Shakespeare", showing: null},
//        {question: "Bell Jar Author", answer: "Plath", showing: null},
//        ...
//      ],
//    },
//    ...
//  ]
const NUM_CATEGORIES = 6;
const NUM_QUESTIONS_PER_CAT = 5;
const NUM_TOTAL_CAT = 18414;
let categories = [];


/** Get NUM_CATEGORIES random category from API.
 * Uses 'offset' to effectively choose random categories
 * Returns array of category ids
 */

async function getCategoryIds() {
    const randomOffsets = getRandomOffsets(NUM_CATEGORIES);
    const ids = [];
    for (offset of randomOffsets){
        const response = await axios.get('http://jservice.io/api/categories/', {params : {count:1, offset: offset}});
        const id = response.data[0].id;
        ids.push(id);
    }
    return ids;
}
/** returns set of random integers between 0 and NUM_TOTAL_CAT
 */
function getRandomOffsets(n) {
    const randomSet = new Set();
    while (randomSet.size < n){
        const random = Math.floor(Math.random() * NUM_TOTAL_CAT);
        randomSet.add(random);
    }
    return randomSet;
}

/** Return object with data about a category:
 *
 *  Returns { title: "Math", clues: clue-array }
 *
 * Where clue-array is:
 *   [
 *      {question: "Hamlet Author", answer: "Shakespeare", showing: null},
 *      {question: "Bell Jar Author", answer: "Plath", showing: null},
 *      ...
 *   ]
 */

async function getCategory(catId) {
    const response = await axios.get('http://jservice.io/api/category', {params : {id : catId}});
    const cluesArray = getCluesArray(response.data.clues);
    return {
        title : response.data.title,
        clues : cluesArray
    }
}

function getCluesArray(clues) {
    console.log(clues);
    return clues.filter((clue) => clue.invalid_count === null).map((clue) => {
        return {
            question : clue.question,
            answer : clue.answer,
            showing : null
        }
    })
}

/** Fill the HTML table#jeopardy with the categories & cells for questions.
 *
 * - The <thead> should be filled w/a <tr>, and a <td> for each category
 * - The <tbody> should be filled w/NUM_QUESTIONS_PER_CAT <tr>s,
 *   each with a question for each category in a <td>
 *   (initally, just show a "?" where the question/answer would go.)
 */

function fillTable() {
    $('thead').html(`<tr>${categories.reduce(fillHead, '')}</tr>`);
    $('tbody').html(fillBody());
}

function fillHead(accum, category) {
    accum += `<td>${category.title}</td>`;
    return accum;
}

function fillBody() {
    let html ='';
    for (let i = 0; i < NUM_QUESTIONS_PER_CAT; i++ ) {
        let trHtml = '';
        for (let j = 0; j < NUM_CATEGORIES; j++) {
            trHtml += `<td data-category=${j} data-clue=${i}>?</td>`
        }
        html += `<tr>${trHtml}</tr>`;
    }
    return html;
}

function fillClue(clue) {
    return '<td>?</td>'
}

/** Handle clicking on a clue: show the question or answer.
 *
 * Uses .showing property on clue to determine what to show:
 * - if currently null, show question & set .showing to "question"
 * - if currently "question", show answer & set .showing to "answer"
 * - if currently "answer", ignore click
 * */

function handleClick(evt) {
    const $target = $(evt.target);
    const categoryIndex = $target.data('category');
    const clueIndex = $target.data('clue');
    const clue = categories[categoryIndex].clues[clueIndex];

    if (clue.showing === null) {
        clue.showing = "question";
        $target.html(clue.question);
    } else if (clue.showing === "question") {
        clue.showing = "answer";
        $target.html(clue.answer);
    } else {
        return
    }
}

/* resets categories and html */
function restart() {
    categories = [];
    $('thead').html('');
    $('tbody').html('');
    setupAndStart();
}

/** Start game:
 *
 * - get random category Ids
 * - get data for each category
 * - create HTML table
 * - add event handlers
 * */

async function setupAndStart() {
    const ids = await getCategoryIds();
    for (let id of ids) {
        const category = await getCategory(id);
        categories.push(category); 
    }
    fillTable()

}

setupAndStart();

/* event delegation for clue clicking */
$('#jeopardy').on('click', handleClick);

/* event handling for remove button */
$('button').on('click', restart);

