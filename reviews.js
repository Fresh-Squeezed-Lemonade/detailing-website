/* =========================================================
   Jordan Clark's Car Detailing — reviews.js
   This file is your review "database". It is PUBLIC: anyone who
   visits the site can download it. So do NOT put email addresses
   in here. Keep customer emails in the review emails you receive.

   HOW TO ADD A REVIEW
   1. A customer submits the form and you get an email.
   2. Copy a block below, paste it at the end of the list (before
      the closing bracket), and fill in what they wrote.
   3. Set active to true to show it on the site, false to hide it.
   4. Save, upload to GitHub, done.

   Rules:
   - rating is a whole number from 1 to 5
   - active is true or false (lowercase, no quotes)
   - every entry except the last needs a comma after its closing }
   - if the review text has a double quote, write it as \"
   ========================================================= */

window.REVIEWS = [
  {
    name: "Example Customer",
    review: "Paste the customer's real words here.",
    rating: 5,
    active: false,   // example only — stays hidden until you set this to true
  },

  {
    name: "Truman C.",
    review: "I have to say for my first ever detail on my car. I was beyond impressed. Just sitting in my car it felt like brand new. The exterior and the interior were handled carefully and expertly. Absolutely wonderful experience/service would highly recommend!",
    rating: 5,
    active: true,
  },

  // Copy this block for each new review:
  // ,{
  //   name: "First name L.",
  //   review: "What they wrote.",
  //   rating: 5,
  //   active: true
  // }
];