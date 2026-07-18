jQuery(window).on("elementor/frontend/init", function () {
  elementorFrontend.hooks.addAction(
    "frontend/element_ready/rkit-bar-chart.default",
    function ($scope, $) {
      var $chart = $scope.find("#barChart");
      var ctx = $chart[0].getContext("2d");

      var labels = $chart.data("label");
      var datasets = $chart.data("datasets");
      var scales = $chart.data("scales");
      var legend = $chart.data("legend");

      var data = {
        labels: labels,
        datasets: [datasets],
      };

      var options = {
        responsive: false,
        maintainAspectRatio: true,
        scales: scales,
        plugins: {
          legend: legend,
        },
      };

      var myChart = new Chart(ctx, {
        type: "bar",
        data: data,
        options: options,
      });

      myChart.resize();
      // Observe element resize
      const resizeObserver = new ResizeObserver(() => {
        myChart.resize();
      });

      resizeObserver.observe($scope[0]);
    }
  );
});