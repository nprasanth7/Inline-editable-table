import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'angular-configurable-table';

  /**
   * sample table data
   */
  postData = [
    {
      serialNumber: '1',
      name: 'TEST',
      email: "test@gmail.com",
      isEditable: true
    },
    {
      serialNumber: '2',
      name: 'TEST',
      email: "test@gmail.com",
      isEditable: true
    },
    {
      serialNumber: '3',
      name: 'TEST',
      email: "test@gmail.com",
      isEditable: true
    },
    {
      serialNumber: '4',
      name: 'TEST',
      email: "test@gmail.com",
      isEditable: true
    },
    {
      serialNumber: '5',
      name: 'TEST',
      email: "test@gmail.com",
      isEditable: true
    },
    {
      serialNumber: '6',
      name: 'TEST',
      email: "test@gmail.com",
      isEditable: true
    }
  ];
  tableConfig = {
    editable: false, // not used
    filter: true, // not used
    select: true, // Select all checkbox enable/ disable,
    selectConfig: {
      key: 'isEditable',
      values: [true]
    },
    expandable: false, // mobile view expand view show / hide
    pagination: false, // enable disable pagination
    lazyLoading: true, // not used
    sorting: true, // enable disable sorting
    buttonPlacement: 'header', // to show hide buttons
    // Possible Values : "header" or "footer" or "row"
    serialNumber: false,
    tooltip: true, // show hide tooltip
    spinnerConfig: {
      color: 'primary',
      mode: 'indeterminate',
      value: 100,
      diameter: 30,
      spinner: false,
      content: 'Loading Assets...'
    },
    columnConfig: [
      {
        label: 'Serial Number',
        colData: 'serialNumber',
        sortDisable: false,
        priority: '1',
        padding: '0px',
        margin: '0px',
        color: 'red',
        formControl: 'input', // 'select' , 'multiSelect' , 'autoComplete',
        style: {
          width: '15%'
        }
      },
      {
        label: 'Name',
        colData: 'name',
        sortDisable: false,
        select: true,
        priority: '2',
        formControl: 'select',
        data: [{
          value: 'test',
          label: "test"
        }, {
          value: 'test',
          label: "test"
        }, {
          value: 'test',
          label: "test"
        }],
        config: {
          value: 'value',
          label: 'label'
        },
        style: {
          width: '10%'
        },
        applySelected: (event) => {
          console.log("applySelected", event);
        }
      },
      {
        label: 'Email',
        placeHolder: 'Email',
        colData: 'email',
        sortDisable: false,
        multiselect: true,
        priority: '3',
        mandatory: true,
        config: {
          label: 'label',
          value: 'value'
        },
        formControl: 'input',
        style: {
          width: '20%'
        }
      }
    ],
    buttons: [

      {
        label: 'Save',
        class: 'next-button',
        image: 'next',
        color: 'primary',
        click: (event, object) => {
          console.log('event', event, 'data', object);

        },
        mouseenter: (event, object) => {
          console.log('event', event, 'data', object);
        },
        event: {
          click: 'click',
          mouseenter: 'mouseenter'
        },
        showButton: true,
        disabled: false
      },
      {
        label: 'Cancel',
        class: 'cancel-button',
        image: 'cancel',
        click: (event, object) => {
          console.log('event', event, 'data', object);

        },
        mouseenter: (event, object) => {
          console.log('event', event, 'data', object);
        },
        event: {
          click: 'click',
          mouseenter: 'mouseenter'
        },
        showButton: true,
        disabled: false
      }
    ],
  };

  ng6TableEvents(event) {
    console.log("ng6TableEvents", event);
  }
}
