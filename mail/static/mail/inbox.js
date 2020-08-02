document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');

  // prevent default form submission and use fetch
  document.querySelector('#compose-form').addEventListener('submit', (event) => {
    event.preventDefault();
    send_email()
  });
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#email-view').style.display = 'none';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#box-name').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  // Load emails for given mailbox and insert into DOM
  let html = '';
  fetch('emails/' + mailbox)
  .then(response => response.json())
  .then(emails => {
    if (emails) {
      html = emails.map((email) => {
        let sender = '<h5> Sender: ' + email.sender + '</h5>';
        let subject = '<h6> Subject: ' + email.subject + '</h6>';
        let timestamp = '<p> Sent: ' + email.timestamp + '</p>';
        if (email.read === true){
          return '<div class="email read" data-id="' + email.id + '" onclick="load_email(this)">' +
          sender + 
          subject + 
          timestamp + '</div>';
        } else {
          return '<div class="email" data-id="' + email.id + '" onclick="load_email(this)">' + 
          sender + 
          subject + 
          timestamp + '</div>';
        }
      }).join('');

    } else {
      html = '<h4> No Emails Found </h4>';
    }
    document.querySelector('#email-container').innerHTML = html;
  })
}

function send_email() {
  // Get value of form fields and make dictionary for fetch
  let recipients = document.querySelector('#compose-recipients').value;
  let subject = document.querySelector('#compose-subject').value;
  let body = document.querySelector('#compose-body').value;
  let email = {
    recipients: recipients,
    subject: subject,
    body: body
  }

  fetch('emails', {
    method: 'POST',
    credentials: 'include',
    headers: new Headers ({
      'content-type': 'application/json'
    }),
    body: JSON.stringify(email)
    })
    .then(response => {
      return response.json();
    })
    .then(data => {
      if (data.error){
        alert(data.error);
        return false;
      }
      alert(data.message);
      load_mailbox('sent');
    })
    .catch(error => {
      console.error(error);
    });
};

function archive_email(email){
  const id = email.getAttribute("data-id");
  const is_archived = email.getAttribute("data-value");

  if (is_archived === 'true'){
    fetch('emails/' + id, {
      method: 'PUT',
      body: JSON.stringify({
        archived: false
      })
    }).then(response => {
      return response.json();
    }).then(data => {
      if (data.error){
        alert(data.error);
        return false;
      }
      alert(data.message);
      load_mailbox('sent');
    })
  }
};

function load_email(email) {

  // Show the email and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'block';

  const email_id = email.getAttribute("data-id");
  let html = '';

  fetch('emails/' + email_id)
  .then(response => response.json())
  .then(email => {
    if (email) {
      let sender = '<h5> Sender: ' + email.sender + '</h5>';
      let recipients = '<h6> Recipients: ' + email.recipients + '</h6>';
      let subject = '<h6> Subject: ' + email.subject + '</h6>';
      let body = '<p>' + email.body + '<p>';
      let timestamp = '<p> Sent: ' + email.timestamp + '</p>';
      
      // check if email is archived to determine which button to add
      if (email.archived === false) {
        var archive_button = '<button class="btn btn-sm btn-outline-secondary" id="archive-button" data-id="' +
          email.id +
          '" data-value="' +
          email.archived +
          '" onclick="archive_email(this)">Archive Email</button>'
      } else {
        var archive_button = '<button class="btn btn-sm btn-outline-secondary" id="archive-button" data-id="' +
          email.id +
          '" data-value="' +
          email.archived +
          '" onclick="archive_email(this)">Unarchive Email</button>'
      }
      // check if mailbox is sent to avoid adding archive button
      if (email.read === true){
        html = '<div class="email read">' + sender + recipients + subject + body + timestamp + archive_button + '</div>';
      } else {
        html = '<div class="email">' + sender + recipients + subject + body + timestamp + archive_button + '</div>';
      }
    } else {
      html = '<h4> No Emails Found </h4>';
    }

    document.querySelector('#email-view').innerHTML = html;
  })
};