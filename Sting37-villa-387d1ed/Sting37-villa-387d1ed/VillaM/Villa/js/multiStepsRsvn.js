const DELUXE_PER_NIGHT = 2000;
const DOUBLE_PER_NIGHT = 1500;
const SINGLE_PER_NIGHT = 1000;

const multiStepRsvnFormId = '#multiStepRsvnForm';
const multiStepRsvnformData = {
  cDate: function (dt) {
    let subject = new Date(dt);
    return [subject.getFullYear(), subject.getMonth() + 1, subject.getDate()].join('-');
  },
  d: function () {
    return {
      cid: $('input[name="cid"]').val(),
      start: $('input[name="startDate"]').val(),
      end: $('input[name="endDate"]').val(),
      type: $('select[name="roomType"]').val(),
      requirement: $('select[name="roomRequirement"]').val(),
      adults: $('select[name="adults"]').val(),
      children: $('select[name="children"]').val(),
      requests: $('textarea[name="specialRequests"]').val(),
      bookedDate: multiStepRsvnformData.cDate(document.getElementsByClassName('bookedDateTxt')[0].innerHTML),
      numNights: document.getElementsByClassName('numNightsTxt')[0].innerHTML,
      totalPrice: document.getElementsByClassName('totalTxt')[0].textContent,
      readySubmit: $('#rsvnNextBtn').attr('readySubmit')
    };
  }
};

// rsvn multi steps
let currentTab = 0;
showTab(currentTab);

function showTab (n) {
  let x = document.getElementsByClassName('rsvnTab');
  x[n].style.display = 'block';
  if (n === 0) {
    document.getElementById('rsvnPrevBtn').style.display = 'none';
  } else {
    document.getElementById('rsvnPrevBtn').style.display = 'inline';
  }
  let rsvnNextBtn = $('#rsvnNextBtn');
  if (n === (x.length - 1)) {
    rsvnNextBtn.text('Submit');
    rsvnNextBtn.attr('readySubmit', 'true');
    rsvnNextBtn.attr('type', 'submit');
    rsvnNextBtn.attr('onclick', 'submitMultiStepRsvn()');
  } else {
    rsvnNextBtn.text('Next');
    rsvnNextBtn.attr('readySubmit', 'false');
    rsvnNextBtn.attr('type', 'button');
    rsvnNextBtn.attr('onclick', 'rsvnNextPrev(1)');
  }
  fixStepIndicator(n);
}

function submitMultiStepRsvn () {
  let canSubmit = document.getElementById('rsvnNextBtn').getAttribute('readySubmit');
  if (!validateRsvnForm() && !canSubmit) {
    return false;
  } else {
    let d = multiStepRsvnformData.d();
    console.log(d);
    let dataStr = Object.values(d).join(' ');
    if (!new UtilityFunctions().findMatchReservedWords(dataStr)) {
      $.ajax({
        url: 'app/process_reservation.php',
        type: 'post',
        data: d
      }).done(function (response) {
        try {
          let out = JSON.parse(response);
          if (out.success === 'true') {
            $(multiStepRsvnFormId).prepend(out.response);
            document.getElementById('rsvnNextBtn').disabled = true;
          }
        } catch (string) {
          $(multiStepRsvnFormId).prepend(response);
        }
      });
    } else {
      console.error('found reserved words');
      alert('Something went wrong!');
    }
  }
}

function fixStepIndicator (n) {
  let i;
  let x = document.getElementsByClassName('step');
  for (i = 0; i < x.length; i++) {
    x[i].className = x[i].className.replace(' active', '');
  }
  x[n].className += ' active';
}

function rsvnNextPrev (n) {
  let x = document.getElementsByClassName('rsvnTab');
  if (n === 1 && !validateRsvnForm()) return false;
  x[currentTab].style.display = 'none';
  currentTab = currentTab + n;
  showTab(currentTab);
}

function validateRsvnForm () {
  let tab = document.getElementsByClassName('rsvnTab');
  let valid = true;
  let inputs = tab[currentTab].getElementsByTagName('input');
  for (let i = 0; i < inputs.length; i++) {
    if (inputs[i].hasAttribute('required')) {
      if (inputs[i].value === '') {
        inputs[i].className += ' invalid';
        valid = false;
      }
    }
  }

  let selects = tab[currentTab].getElementsByTagName('select');
  for (let i = 0; i < selects.length; i++) {
    if (selects[i].hasAttribute('required')) {
      if (selects[i].value === '') {
        selects[i].className += ' invalid';
        valid = false;
      }
    }
  }

  if (valid) {
    document.getElementsByClassName('step')[currentTab].className += ' finish';
    new ReservationCost($('select[name="roomType"]').val(),
      $('input[name="startDate"]').val(),
      $('input[name="endDate"]').val()).displayAll();
  }
  return valid;
}

class ReservationCost {
  constructor (roomType, startDate, endDate) {
    let today = new Date();
    this.bookDate = today.toDateString();
    this.roomType = roomType;
    this.startDate = new Date(startDate);
    this.endDate = new Date(endDate);
  }

  priceByRoomType () {
    if (this.roomType === 'Deluxe') {
      return DELUXE_PER_NIGHT;
    }
    if (this.roomType === 'Option 2') {
      return DOUBLE_PER_NIGHT;
    }
    if (this.roomType === 'Single') {
      return SINGLE_PER_NIGHT;
    }
    return 0;
  }

  numNights () {
    return new UtilityFunctions().dateDiffInDays(this.startDate, this.endDate);
  }

  displayBookedDate () {
    document.getElementsByClassName('bookedDateTxt')[0].innerHTML = this.bookDate;
  }

  displayRoomPrice () {
    // Set the .amount span inside .roomPriceTxt
    const price = this.numNights() * this.priceByRoomType();
    const roomPriceAmount = document.querySelector('.roomPriceTxt .amount');
    if (roomPriceAmount) {
      roomPriceAmount.textContent = price.toLocaleString();
    }
  }

  displayNumNights () {
    document.getElementsByClassName('numNightsTxt')[0].innerHTML = this.numNights().toString();
    // Set the per night price
    const perNight = this.priceByRoomType();
    const perNightSpan = document.querySelector('.roomPricePerNightTxt');
    if (perNightSpan) {
      perNightSpan.textContent = perNight.toLocaleString();
    }
  }

  displayFromTo () {
    let start = this.startDate.getFullYear() + '-' + (this.startDate.getMonth() + 1) + '-' + this.startDate.getDate();
    let end = this.endDate.getFullYear() + '-' + (this.endDate.getMonth() + 1) + '-' + this.endDate.getDate();
    document.getElementsByClassName('fromToTxt')[0].innerHTML = start + ' to ' + end;
  }

  displayTotalCost () {
    let totalRoomPrice = (this.numNights() * this.priceByRoomType());
    // Set taxes
    const taxesSpan = document.querySelector('.taxesWrap .taxesTxt');
    let taxes = 0;
    if (taxesSpan) {
      taxes = parseInt(taxesSpan.textContent.replace(/,/g, '')) || 0;
    }
    // Set total
    const totalSpan = document.querySelector('.totalWrap .totalTxt');
    if (totalSpan) {
      totalSpan.textContent = (totalRoomPrice + taxes).toLocaleString();
    }
  }

  displayAll () {
    this.displayBookedDate();
    this.displayRoomPrice();
    this.displayNumNights();
    this.displayFromTo();
    this.displayTotalCost();
  }
}
