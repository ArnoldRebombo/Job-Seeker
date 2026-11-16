const jobs = [
  { id: 1, title: "Front-end Developer", company: "Pixel Studio", location: "Remote", experience: "Junior level", time: "Full time", type: "Permanent", pay: 18000 },
  { id: 2, title: "Product Designer", company: "North & Co.", location: "Hybrid", experience: "Junior level", time: "Full time", type: "Contract", pay: 15000 },
  { id: 3, title: "Senior Data Analyst", company: "Data Works", location: "On-site", experience: "Senior level", time: "Part time", type: "Permanent", pay: 20000 },
  { id: 4, title: "Project Manager", company: "Bright Agency", location: "Remote", experience: "Senior level", time: "Full time", type: "Permanent", pay: 19500 }
];

let nextJobId = 5;
let applications = {};

const workingOptions = ["Full time", "Part time"];
const employmentOptions = ["Permanent", "Contract"];

const jobsContainer = document.getElementById("jobs");
const resultsTitle = document.getElementById("resultsTitle");
const addJobForm = document.getElementById("addJobForm");
const minimumSalary = document.getElementById("lo");
const maximumSalary = document.getElementById("hi");
const salaryText = document.getElementById("salTxt");
const salaryFill = document.getElementById("fill");
const workingTimeFilters = document.getElementById("workingTimeFilters");
const employmentTypeFilters = document.getElementById("employmentTypeFilters");

function formatSalary(amount) {
  return `R${Number(amount).toLocaleString("en-ZA")}`;
}

function escapeHtml(value) {
  const element = document.createElement("span");
  element.textContent = value;
  return element.innerHTML;
}

function renderOptions(containerId, options) {
  const container = document.getElementById(containerId);

  container.innerHTML = options.map((option, index) => `
    <label class="option">
      <input type="checkbox" value="${option}" id="${containerId}-${index}">
      <span>${option}</span>
    </label>
  `).join("");
}

function getCheckedValues(containerId) {
  const checkboxes = document.querySelectorAll(`#${containerId} input:checked`);
  const values = [];

  checkboxes.forEach(checkbox => {
    values.push(checkbox.value);
  });

  return values;
}

function updateSalary() {
  let low = Number(minimumSalary.value);
  let high = Number(maximumSalary.value);
  const step = Number(minimumSalary.step);

  if (high - low < step) {
    if (document.activeElement === minimumSalary) {
      low = high - step;
    } else {
      high = low + step;
    }
  }

  low = Math.max(Number(minimumSalary.min), low);
  high = Math.min(Number(maximumSalary.max), high);

  minimumSalary.value = low;
  maximumSalary.value = high;
  salaryText.textContent = `${formatSalary(low)} - ${formatSalary(high)}`;

  const min = Number(minimumSalary.min);
  const max = Number(maximumSalary.max);
  salaryFill.style.left = `${((low - min) / (max - min)) * 100}%`;
  salaryFill.style.right = `${100 - ((high - min) / (max - min)) * 100}%`;
}

function getApplicationStatus(job) {
  return applications[job.id] || "not-applied";
}

function updateStatus(jobId, status) {
  if (status === "not-applied") {
    delete applications[jobId];
  } else {
    applications[jobId] = status;
  }

  updateSummary();
}

function updateSummary() {
  const statusValues = Object.values(applications);

  const appliedCount = statusValues.filter(status =>
    status === "applied" || status === "rejected" || status === "hired"
  ).length;
  const rejectedCount = statusValues.filter(status => status === "rejected").length;
  const hiredCount = statusValues.filter(status => status === "hired").length;

  document.getElementById("appliedCount").textContent = appliedCount;
  document.getElementById("rejectedCount").textContent = rejectedCount;
  document.getElementById("hiredCount").textContent = hiredCount;
}

function renderJobs(items) {
  if (items.length === 1) {
    resultsTitle.textContent = "1 recommended job";
  } else {
    resultsTitle.textContent = `${items.length} recommended jobs`;
  }

  if (items.length === 0) {
    jobsContainer.innerHTML = '<div class="empty">No jobs match these filters.</div>';
    return;
  }

  jobsContainer.innerHTML = items.map(job => {
    const status = getApplicationStatus(job);

    return `
      <article class="job">
        <div class="job-top">
          <div>
            <h3>${escapeHtml(job.title)}</h3>
            <div class="company">${escapeHtml(job.company)}</div>
          </div>
          <div class="pay">${formatSalary(job.pay)}</div>
        </div>

        <div class="tags">
          <span class="tag">${escapeHtml(job.location)}</span>
          <span class="tag">${escapeHtml(job.experience)}</span>
          <span class="tag">${escapeHtml(job.time)}</span>
        </div>

        <div class="application">
          <label>
            <span>Application status</span>
            <select class="application-status" data-job-id="${job.id}">
              <option value="not-applied" ${status === "not-applied" ? "selected" : ""}>Not applied</option>
              <option value="applied" ${status === "applied" ? "selected" : ""}>Applied - waiting</option>
              <option value="rejected" ${status === "rejected" ? "selected" : ""}>Rejected</option>
              <option value="hired" ${status === "hired" ? "selected" : ""}>Got the job</option>
            </select>
          </label>
          <button type="button" class="delete-job" data-job-id="${job.id}">Delete</button>
        </div>
      </article>
    `;
  }).join("");

  updateSummary();
}

function filterJobs() {
  const role = document.getElementById("role").value;
  const location = document.getElementById("location").value;
  const experience = document.getElementById("experience").value;
  const minimumPay = Number(minimumSalary.value);
  const maximumPay = Number(maximumSalary.value);
  const workingTimes = getCheckedValues(workingTimeFilters.id);
  const employmentTypes = getCheckedValues(employmentTypeFilters.id);

  const matchingJobs = jobs.filter(job =>
    (!role || job.title === role) &&
    (!location || job.location === location) &&
    (!experience || job.experience === experience) &&
    job.pay >= minimumPay &&
    job.pay <= maximumPay &&
    (!workingTimes.length || workingTimes.includes(job.time)) &&
    (!employmentTypes.length || employmentTypes.includes(job.type))
  );

  renderJobs(matchingJobs);
}

function addJob(event) {
  event.preventDefault();

  const title = document.getElementById("jobTitle").value.trim();
  const company = document.getElementById("jobCompany").value.trim();
  const location = document.getElementById("jobLocation").value;
  const pay = Number(document.getElementById("jobPay").value);

  if (title === "" || company === "" || pay === 0) {
    return;
  }

  jobs.unshift({
    id: nextJobId,
    title: title,
    company: company,
    location: location,
    experience: "Junior level",
    time: "Full time",
    type: "Permanent",
    pay: pay
  });

  nextJobId = nextJobId + 1;
  addJobForm.reset();
  filterJobs();
}

function deleteJob(jobId) {
  const jobIndex = jobs.findIndex(job => job.id === jobId);

  if (jobIndex !== -1) {
    jobs.splice(jobIndex, 1);
    delete applications[jobId];
    filterJobs();
  }
}

renderOptions(workingTimeFilters.id, workingOptions);
renderOptions(employmentTypeFilters.id, employmentOptions);

minimumSalary.addEventListener("input", () => {
  updateSalary();
  filterJobs();
});

maximumSalary.addEventListener("input", () => {
  updateSalary();
  filterJobs();
});

document.getElementById("searchButton").addEventListener("click", filterJobs);
document.querySelectorAll(".search select").forEach(select => {
  select.addEventListener("change", filterJobs);
});

document.querySelector(".filters").addEventListener("change", filterJobs);
addJobForm.addEventListener("submit", addJob);

document.getElementById("reset").addEventListener("click", () => {
  document.querySelectorAll(".filters input").forEach(input => {
    input.checked = false;
  });

  document.querySelectorAll(".search select:not(#pay-period)").forEach(select => {
    select.selectedIndex = 0;
  });

  minimumSalary.value = minimumSalary.min;
  maximumSalary.value = maximumSalary.max;
  updateSalary();
  filterJobs();
});

jobsContainer.addEventListener("change", event => {
  const select = event.target.closest(".application-status");

  if (select) {
    const jobId = Number(select.dataset.jobId);
    updateStatus(jobId, select.value);
  }
});

jobsContainer.addEventListener("click", event => {
  const button = event.target.closest(".delete-job");

  if (button) {
    const jobId = Number(button.dataset.jobId);
    deleteJob(jobId);
  }
});

document.getElementById("learn").addEventListener("click", () => {
  alert("Bright Path Plus helps you discover careers that fit your skills.");
});

updateSalary();
renderJobs(jobs);
