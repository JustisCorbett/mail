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

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#box-name').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  
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