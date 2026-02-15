import { Semester, Unit, Content, Summary, Quiz, ScheduleItem } from "@/types";

export const sampleSemesters: Semester[] = [
  { id: "sem-1", name: "Spring 2026", createdAt: "2026-01-15T00:00:00Z" },
];

export const sampleUnits: Unit[] = [
  {
    id: "unit-1",
    semesterId: "sem-1",
    name: "Week 1: Introduction to Macroeconomics",
    subject: "Macroeconomics",
    createdAt: "2026-01-20T00:00:00Z",
  },
  {
    id: "unit-2",
    semesterId: "sem-1",
    name: "Week 2: Supply and Demand",
    subject: "Macroeconomics",
    createdAt: "2026-01-27T00:00:00Z",
  },
  {
    id: "unit-3",
    semesterId: "sem-1",
    name: "Week 3: Data Structures - Trees",
    subject: "Computer Science",
    createdAt: "2026-02-03T00:00:00Z",
  },
];

export const sampleContents: Content[] = [
  {
    id: "content-1",
    unitId: "unit-1",
    type: "youtube",
    title: "Intro to Macroeconomics - Lecture 1",
    url: "https://youtube.com/watch?v=example1",
    rawText: `Macroeconomics: Macroeconomics is the branch of economics that studies the behavior and performance of an economy as a whole rather than individual markets or sectors.

GDP - Gross Domestic Product is the total monetary value of all finished goods and services produced within a country's borders in a specific time period. It serves as a comprehensive scorecard of a given country's economic health.

Inflation refers to the general increase in prices and fall in the purchasing value of money over time. Central banks attempt to limit inflation and avoid deflation to keep the economy running smoothly.

Unemployment Rate is defined as the percentage of the total labor force that is jobless and actively seeking employment. It is one of the most closely watched indicators of economic health.

Fiscal Policy: Fiscal policy involves government spending and taxation decisions designed to influence a country's economic conditions. Expansionary fiscal policy increases government spending or decreases taxes, while contractionary policy does the opposite.

Monetary Policy refers to actions undertaken by a nation's central bank to control the money supply and achieve macroeconomic goals that promote sustainable economic growth. The primary tools include adjusting interest rates and changing reserve requirements.

The Business Cycle describes the natural rise and fall of economic growth that occurs over time. It consists of four phases: expansion, peak, contraction, and trough. Understanding these cycles helps economists predict future economic conditions.

Aggregate Demand is the total demand for goods and services within a particular market or economy. It represents the total amount of money exchanged for those goods and services at a specific price level and point in time.

Aggregate Supply represents the total supply of goods and services that firms in a national economy plan to sell during a specific time period. It is the total amount of goods and services that firms are willing and able to sell at a given price level.

Trade Balance: The trade balance is the difference between the monetary value of a nation's exports and imports over a certain time period. A positive balance is known as a trade surplus, while a negative balance is called a trade deficit.`,
    status: "ready",
    createdAt: "2026-01-20T01:00:00Z",
  },
  {
    id: "content-2",
    unitId: "unit-2",
    type: "pdf",
    title: "Supply and Demand Chapter Slides",
    rawText: `Supply and Demand: Supply and demand is one of the most fundamental concepts in economics. It describes the relationship between the availability of a product and the desire for that product among buyers.

The Law of Demand states that, all other factors being equal, as the price of a good or service increases, consumer demand for the good or service will decrease, and vice versa. This inverse relationship between price and quantity demanded is fundamental to understanding market behavior.

The Law of Supply states that, all other factors being equal, as the price of a good or service increases, the quantity of goods or services that suppliers offer will increase, and vice versa. Higher prices give producers an incentive to supply more because of higher potential profits.

Market Equilibrium is the state where market supply and demand balance each other, and as a result prices become stable. When these two forces are in balance, there is no tendency for the market price to change.

Price Elasticity of Demand measures the responsiveness of the quantity demanded to a change in price. If demand is elastic, a small price change leads to a large change in quantity demanded. If demand is inelastic, quantity demanded is relatively unresponsive to price changes.

Consumer Surplus is the difference between the total amount that consumers are willing and able to pay for a good or service and the total amount that they actually pay. It represents the economic benefit that consumers receive when they are able to purchase a product for less than they would be willing to pay.

Producer Surplus is the difference between what producers are actually paid for a product and the minimum amount they would be willing to accept. It measures the benefit that producers receive from selling at a market price higher than their minimum acceptable price.

A Price Ceiling is a government-imposed limit on how high a price can be charged for a product. For a price ceiling to be effective, it must be set below the natural market equilibrium price.

A Price Floor is a government-imposed minimum price below which goods cannot be sold. For a price floor to be effective, it must be set above the natural market equilibrium price. Minimum wage is a common example.

Shifts in supply and demand curves occur when factors other than price change. Demand shifters include consumer income, tastes and preferences, prices of related goods, expectations, and number of buyers. Supply shifters include input costs, technology, expectations, number of sellers, and government policies.`,
    status: "ready",
    createdAt: "2026-01-27T01:00:00Z",
  },
  {
    id: "content-3",
    unitId: "unit-3",
    type: "text",
    title: "Trees in Computer Science - Lecture Notes",
    rawText: `Binary Tree: A binary tree is a hierarchical data structure in which each node has at most two children, referred to as the left child and the right child. Binary trees are used to implement binary search trees and binary heaps.

Binary Search Tree (BST) is a binary tree data structure where each node has a comparable key and satisfies the constraint that the key in any node is larger than the keys in all nodes in that node's left subtree and smaller than the keys in all nodes in that node's right subtree.

Tree Traversal refers to the process of visiting each node in a tree data structure exactly once in a systematic way. The three main types of depth-first traversal are in-order, pre-order, and post-order.

In-Order Traversal: In-order traversal visits the left subtree first, then the root node, and finally the right subtree. For a BST, in-order traversal produces the nodes in sorted order.

Pre-Order Traversal visits the root node first, then the left subtree, and finally the right subtree. Pre-order traversal is useful for creating a copy of the tree.

Post-Order Traversal visits the left subtree first, then the right subtree, and finally the root node. Post-order traversal is useful for deleting or freeing the tree.

AVL Tree is a self-balancing binary search tree where the difference between heights of left and right subtrees cannot be more than one for all nodes. AVL trees ensure O(log n) time for search, insert, and delete operations.

Red-Black Tree is a self-balancing binary search tree where each node stores an extra bit for color (red or black). The tree uses these colors to ensure that it remains approximately balanced during insertions and deletions.

Heap: A heap is a specialized tree-based data structure which is essentially an almost complete tree that satisfies the heap property. In a max heap, for any given node the value of the node is greater than or equal to the values of its children.

Time Complexity: Basic operations on a balanced BST (search, insert, delete) take O(log n) time, where n is the number of nodes. Unbalanced BSTs can degrade to O(n) in the worst case, which is why self-balancing variants like AVL and Red-Black trees are important.`,
    status: "ready",
    createdAt: "2026-02-03T01:00:00Z",
  },
];

export const sampleSummaries: Summary[] = [
  {
    id: "summary-1",
    unitId: "unit-1",
    contentIds: ["content-1"],
    title: "Week 1: Introduction to Macroeconomics - Study Guide",
    executiveSummary: [
      "Macroeconomics studies the behavior and performance of an economy as a whole rather than individual markets or sectors.",
      "GDP (Gross Domestic Product) is the total monetary value of all finished goods and services produced within a country's borders.",
      "Inflation refers to the general increase in prices and fall in the purchasing value of money over time.",
      "The Business Cycle describes the natural rise and fall of economic growth through four phases: expansion, peak, contraction, and trough.",
      "Aggregate Demand and Aggregate Supply represent the total demand and supply of goods and services within a national economy.",
    ],
    keyDefinitions: [
      { term: "Macroeconomics", definition: "The branch of economics that studies the behavior and performance of an economy as a whole rather than individual markets or sectors." },
      { term: "GDP", definition: "The total monetary value of all finished goods and services produced within a country's borders in a specific time period." },
      { term: "Inflation", definition: "The general increase in prices and fall in the purchasing value of money over time." },
      { term: "Unemployment Rate", definition: "The percentage of the total labor force that is jobless and actively seeking employment." },
      { term: "Fiscal Policy", definition: "Government spending and taxation decisions designed to influence a country's economic conditions." },
      { term: "Monetary Policy", definition: "Actions undertaken by a nation's central bank to control the money supply and achieve macroeconomic goals." },
      { term: "Business Cycle", definition: "The natural rise and fall of economic growth that occurs over time, consisting of expansion, peak, contraction, and trough." },
      { term: "Aggregate Demand", definition: "The total demand for goods and services within a particular market or economy at a specific price level." },
      { term: "Trade Balance", definition: "The difference between the monetary value of a nation's exports and imports over a certain time period." },
    ],
    detailedBreakdown: [
      {
        heading: "Introduction & Overview",
        content: "Macroeconomics is the branch of economics that studies the behavior and performance of an economy as a whole rather than individual markets or sectors. This lecture introduces the foundational concepts that underpin macroeconomic analysis, including key indicators like GDP, inflation, and unemployment.",
      },
      {
        heading: "Key Economic Indicators",
        content: "GDP (Gross Domestic Product) is the total monetary value of all finished goods and services produced within a country's borders. Inflation refers to the general increase in prices and fall in the purchasing value of money over time. The Unemployment Rate is the percentage of the total labor force that is jobless and actively seeking employment. Together, these three indicators form the core metrics used to assess economic health.",
      },
      {
        heading: "Government Policy Tools",
        content: "Fiscal Policy involves government spending and taxation decisions designed to influence economic conditions. Expansionary fiscal policy increases spending or decreases taxes, while contractionary policy does the opposite. Monetary Policy involves actions by the central bank to control money supply, primarily through adjusting interest rates and changing reserve requirements.",
      },
      {
        heading: "Aggregate Economy",
        content: "The Business Cycle describes the natural rise and fall of economic growth through four phases: expansion, peak, contraction, and trough. Aggregate Demand represents the total demand for goods and services at a specific price level. Aggregate Supply represents the total supply that firms plan to sell. The Trade Balance measures the difference between exports and imports.",
      },
    ],
    createdAt: "2026-01-20T02:00:00Z",
  },
];

export const sampleQuizzes: Quiz[] = [
  {
    id: "quiz-1",
    unitId: "unit-1",
    summaryId: "summary-1",
    title: "Quiz: Week 1 - Introduction to Macroeconomics",
    questions: [
      {
        id: "q-1",
        type: "mcq",
        question: 'What is the definition of "Macroeconomics"?',
        options: [
          "The branch of economics that studies the behavior and performance of an economy as a whole rather than individual markets or sectors.",
          "The total monetary value of all finished goods and services produced within a country's borders in a specific time period.",
          "The general increase in prices and fall in the purchasing value of money over time.",
          "Government spending and taxation decisions designed to influence a country's economic conditions.",
        ],
        correctAnswer: "The branch of economics that studies the behavior and performance of an economy as a whole rather than individual markets or sectors.",
        explanation: "Macroeconomics is the branch of economics that studies the behavior and performance of an economy as a whole.",
      },
      {
        id: "q-2",
        type: "mcq",
        question: 'What is the definition of "GDP"?',
        options: [
          "The percentage of the total labor force that is jobless and actively seeking employment.",
          "The total monetary value of all finished goods and services produced within a country's borders in a specific time period.",
          "The natural rise and fall of economic growth that occurs over time.",
          "Actions undertaken by a nation's central bank to control the money supply.",
        ],
        correctAnswer: "The total monetary value of all finished goods and services produced within a country's borders in a specific time period.",
        explanation: "GDP stands for Gross Domestic Product and measures total economic output.",
      },
      {
        id: "q-3",
        type: "mcq",
        question: 'What does "Inflation" refer to?',
        options: [
          "The general increase in prices and fall in the purchasing value of money over time.",
          "The total demand for goods and services within a particular market or economy.",
          "The difference between exports and imports over a certain time period.",
          "The percentage of the labor force that is jobless.",
        ],
        correctAnswer: "The general increase in prices and fall in the purchasing value of money over time.",
        explanation: "Inflation is the general increase in prices and fall in purchasing value of money.",
      },
      {
        id: "q-4",
        type: "mcq",
        question: "What are the four phases of the Business Cycle?",
        options: [
          "Expansion, peak, contraction, and trough",
          "Growth, stability, decline, and recovery",
          "Inflation, deflation, stagnation, and recession",
          "Supply, demand, equilibrium, and surplus",
        ],
        correctAnswer: "Expansion, peak, contraction, and trough",
        explanation: "The Business Cycle consists of expansion, peak, contraction, and trough phases.",
      },
      {
        id: "q-5",
        type: "mcq",
        question: "Which policy tool involves adjusting interest rates?",
        options: [
          "Fiscal Policy",
          "Trade Policy",
          "Monetary Policy",
          "Supply-side Policy",
        ],
        correctAnswer: "Monetary Policy",
        explanation: "Monetary Policy involves actions by the central bank, primarily adjusting interest rates and reserve requirements.",
      },
      {
        id: "q-6",
        type: "flashcard",
        question: "Define: Fiscal Policy",
        correctAnswer: "Government spending and taxation decisions designed to influence a country's economic conditions.",
        explanation: "Fiscal Policy: Government spending and taxation decisions designed to influence a country's economic conditions.",
      },
      {
        id: "q-7",
        type: "flashcard",
        question: "Define: Aggregate Demand",
        correctAnswer: "The total demand for goods and services within a particular market or economy at a specific price level.",
        explanation: "Aggregate Demand represents the total demand for goods and services at a specific price level and point in time.",
      },
      {
        id: "q-8",
        type: "flashcard",
        question: "Define: Trade Balance",
        correctAnswer: "The difference between the monetary value of a nation's exports and imports over a certain time period.",
        explanation: "A positive trade balance is a surplus; a negative balance is a deficit.",
      },
      {
        id: "q-9",
        type: "flashcard",
        question: "What is key takeaway #1 from this lecture?",
        correctAnswer: "Macroeconomics studies the behavior and performance of an economy as a whole rather than individual markets or sectors.",
        explanation: "Macroeconomics looks at the big picture of economic activity.",
      },
      {
        id: "q-10",
        type: "flashcard",
        question: "What is key takeaway #2 from this lecture?",
        correctAnswer: "GDP (Gross Domestic Product) is the total monetary value of all finished goods and services produced within a country's borders.",
        explanation: "GDP is the primary measure of economic output.",
      },
    ],
    createdAt: "2026-01-20T03:00:00Z",
  },
];

export const sampleScheduleItems: ScheduleItem[] = [
  {
    id: "sched-1",
    unitId: "unit-1",
    quizId: "quiz-1",
    unitName: "Week 1: Introduction to Macroeconomics",
    nextReviewDate: new Date().toISOString(),
    interval: 1,
    easeFactor: 2.5,
    repetitions: 1,
    lastScore: 3,
    status: "due",
  },
];
