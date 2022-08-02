// const GraphUsage = document.getElementById("usagegraph");
// const QuarterlyData = document.getElementById("quarterlyusage");
// const PaymentsPie = document.getElementById("quarterlyusage");

const StatString = sessionStorage.getItem("statistics");
const statistics = JSON.parse(StatString);
delete statistics["message"];
delete statistics["rights"];
console.log(statistics);

const user_stats = statistics["user_stats"];
const [firstred, secondred, thirdread, ...usercounts] = statistics["revenue"];
const [currpay, prevpay] = statistics["payments"];

const currev = (firstred - secondred) * 130 + 50 * usercounts[0];
const currentRevenue = [
  { x: "paid", value: currpay },
  { x: "Pending-payment", value: currev - currpay },
];
var CurrentMonthRevenue = anychart.pie(currentRevenue);
CurrentMonthRevenue.container("currev");
CurrentMonthRevenue.title("Current Month variation in revenue collection");
CurrentMonthRevenue.draw();

const prevrev = (secondred - thirdread) * 130 + 50 * usercounts[1];
const PreviousRevenue = [
  { x: "paid", value: prevpay },
  { x: "Pending-payment", value: prevrev - prevpay },
];
var PreviousMonthRevenue = anychart.pie(PreviousRevenue);
PreviousMonthRevenue.container("prerev");
PreviousMonthRevenue.title("Previous Month variation in revenue collection");
PreviousMonthRevenue.draw();

const revenuevar = [
  { x: "current month", value: currev },
  { x: "previous-month", value: prevrev },
];
var RevenueVariation = anychart.pie(revenuevar);
RevenueVariation.container("revenuevar");
RevenueVariation.title("variation in revenue collected");
RevenueVariation.draw();

// show variation in how users have tended to their bill
var data = anychart.data.set([
  ["Current month", ...user_stats[0]],
  ["Previous month", ...user_stats[1]],
]);

//   map the data
var seriesData_1 = data.mapAs({ x: 0, value: 1 });
var seriesData_2 = data.mapAs({ x: 0, value: 2 });
var seriesData_3 = data.mapAs({ x: 0, value: 3 });
var seriesData_4 = data.mapAs({ x: 0, value: 4 });

// create a chart
var chart = anychart.column();

// create the first series, set the data and name
var series1 = chart.column(seriesData_1);
series1.name("Fully paid");
var series2 = chart.column(seriesData_2);
series2.name("paid less than 50%");
var series3 = chart.column(seriesData_3);
series3.name("paid more than 50%");
var series4 = chart.column(seriesData_4);
series4.name("no attempt on payment");

// set the chart title
chart.title("Current and previous payment variation");

// set the titles of the axes
chart.xAxis().title("Months");
chart.yAxis().title("Number of users");

// set the container id
chart.container("paymnetvariation");

chart.barsPadding(0.1);
chart.barGroupsPadding(2);
// initiate drawing the chart
chart.draw();

// show variation in water consumption
var MonthlyConsumption = anychart.data.set([
  ["Current month", 9],
  ["Previous month", 7],
]);

var monthlysrsdt = MonthlyConsumption.mapAs({ x: 0, value: 1 });
var monthly = anychart.column();
var monthlysrs = monthly.column(monthlysrsdt);
monthly.title("Current and previous water usage");
monthly.xAxis().title("Months");
monthly.yAxis().title("Units of water used");
monthly.container("monthlyvariation");
monthly.draw();

// create graph for the monthly usage
/*const MonthlyDataConsumption = [
    { x: "Jan", value: 8 },
    { x: "Feb", value: 20 },
    { x: "Mar", value: 37 },
    { x: "Apr", value: 48 },
    { x: "May", value: 56 },
    { x: "June", value: 63 },
    { x: "Jul", value: 72 },
  ];
  const MonthlyDataConsumption2 = [
    { x: "Jan", value: 8 },
    { x: "Feb", value: 20 },
    { x: "Mar", value: 37 },
    { x: "Apr", value: 48 },
    { x: "May", value: 56 },
    { x: "June", value: 63 },
    { x: "Jul", value: 72 },
  ];
  
  // create graph
  var chart = anychart.column();
  
  var series = chart.column(MonthlyDataConsumption);
  series.name("usage for ");
  var series = chart.column(MonthlyDataConsumption2);
  
  chart.container("usagegraph");
  
  chart.title();
  chart.xAxis().title("Manager");
  chart.yAxis().title("Sales, $");
  // set the padding between columns
  chart.barsPadding(-0.5);
  
  // set the padding between column groups
  chart.barGroupsPadding(2);
  
  chart.draw();
  /**
   * anychart.onDocumentReady(function () {
  
      // create a data set
      var data = anychart.data.set([
        ["John", 10000, 12500],
        ["Jake", 12000, 15000],
        ["Peter", 13000, 16500],
        ["James", 10000, 13000],
        ["Mary", 9000, 11000]
      ]);
  
      // map the data
      var seriesData_1 = data.mapAs({x: 0, value: 1});
      var seriesData_2 = data.mapAs({x: 0, value: 2});
  
      // create a chart
      var chart = anychart.column();
  
      // create the first series, set the data and name
      var series1 = chart.column(seriesData_1);
      series1.name("Sales in 2015");
  
      // configure the visual settings of the first series
      series1.normal().fill("#00cc99", 0.3);
      series1.hovered().fill("#00cc99", 0.1);
      series1.selected().fill("#00cc99", 0.5);
      series1.normal().stroke("#00cc99", 1, "10 5", "round");
      series1.hovered().stroke("#00cc99", 2, "10 5", "round");
      series1.selected().stroke("#00cc99", 4, "10 5", "round");
  
      // create the second series, set the data and name
      var series2 = chart.column(seriesData_2);
      series2.name("Sales in 2016");
  
      // configure the visual settings of the second series
      series2.normal().fill("#0066cc", 0.3);
      series2.hovered().fill("#0066cc", 0.1);
      series2.selected().fill("#0066cc", 0.5);
      series2.normal().hatchFill("forward-diagonal", "#0066cc", 1, 15);
      series2.hovered().hatchFill("forward-diagonal", "#0066cc", 1, 15);
      series2.selected().hatchFill("forward-diagonal", "#0066cc", 1, 15);
      series2.normal().stroke("#0066cc");
      series2.hovered().stroke("#0066cc", 2);
      series2.selected().stroke("#0066cc", 4);
  
      // set the chart title
      chart.title("Column Chart: Appearance");
  
      // set the titles of the axes
      chart.xAxis().title("Manager");
      chart.yAxis().title("Sales, $");
  
      // set the container id
      chart.container("container");
  
      // initiate drawing the chart
      chart.draw();
  });
   */

// create for quartely usage
/*const quartelyConsumption = [
    { x: "Jan-Mar", value: 65 },
    { x: "Apr-June", value: 167 },
    { x: "Jul-Sept", value: 72 },
    { x: "Oct-Dec", value: 0 },
  ];
  
  var pie = anychart.pie(quartelyConsumption);
  pie.container("quarterlyusage");
  pie.draw();
  /*
  chart.normal().fill("#669999", 0.5);
  chart.hovered().fill("#666699", 0.5);
  chart.selected().fill("#666699", 0.7);
  chart.normal().hatchFill("forward-diagonal", "#669999");
  chart.hovered().hatchFill(null);
  chart.selected().hatchFill(null);
  chart.normal().stroke("#669999", 2);
  chart.hovered().stroke("#669999", 2);
  chart.normal().outline().enabled(true);
  chart.normal().outline().width("5%");
  chart.hovered().outline().width("10%");
  chart.selected().outline().width("3");
  chart.selected().outline().fill("#455a64");
  chart.selected().outline().stroke(null);
  chart.selected().outline().offset(2);
  
  // enable aquastyle
  chart.fill("aquastyle");
  // set the start angle
  chart.startAngle(90);
  // set the sorting mode
  chart.sort("asc"); desc asc none
  // set the explosion range in selected state
  chart.selected().explode("3%");
  // explode the fourth and fifth slices
  chart.select([3, 4]);
  // set the radius
  pie2.radius("30%")
  // set the position of labels
  chart.labels().position("outside");
  // configure connectors
  chart.connectorStroke({color: "#595959", thickness: 2, dash:"2 2"});
  */

// TODO
// For pie payments
/**
 * Two pie charts
 * 1)show how people have faired in paying bill
 * 2)Show revenue collected
 *
 * for quartely data show
 * 1)consumption of water
 * 2)amount of revenue expected
 * 3)arrears pending
 * 4)show how users varies in paying bill i.e fully, >50% ,<50%,no attempt
 *
 * main page shows comparison betweeen current month and previous
 * monthly data
 * 1)expected revenue --pie chart
 * 2)show amount received
 * 3)arrears pending
 * ********
 * tabular data
 * 4)show how users varies in paying bill i.e fully, >50% ,<50%,no attempt
 */

// main page
// show how revenue is fairing*/
