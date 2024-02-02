document.addEventListener('DOMContentLoaded', function () {
    // Handle bulk create button click
    document.getElementById('bulk-create').addEventListener('click', function () {
        document.getElementById('bulk-create-section').style.display = 'block';
    });

    // Handle select file button click
    document.getElementById('select-file').addEventListener('click', function () {
        document.getElementById('file-input').click();
    });

    // Function to read the file
    function readFile(file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const jsonData = convertToJSON(workbook);
            document.getElementById('process-file').jsonData = jsonData;
        };
        reader.readAsArrayBuffer(file);
    }

    // Convert workbook to JSON
    function convertToJSON(workbook) {
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        return XLSX.utils.sheet_to_json(worksheet);
    }

    // Handle process file button click
    document.getElementById('process-file').addEventListener('click', function () {
        const jsonData = this.jsonData;
        if (jsonData) {
            downloadJSONAsTextFile(jsonData, "emailTemplates.txt");
        }
    });

    // Function to download JSON as a text file
    function downloadJSONAsTextFile(jsonData, filename) {
        const text = JSON.stringify(jsonData, null, 2);
        const element = document.createElement('a');
        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
        element.setAttribute('download', filename);
        element.style.display = 'none';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    }

    // Handle trigger type change
    var triggerTypeSelect = document.getElementById('trigger-type');
    var fieldTypeGroup = document.getElementById('field-type-group');

    triggerTypeSelect.addEventListener('change', function () {
        if (this.value === 'checklist-options') {
            fieldTypeGroup.style.display = 'flex';
        } else {
            fieldTypeGroup.style.display = 'none';
        }
    });

    // Event listener for the 'Create and Download' button
    document.getElementById('create-quick-template').addEventListener('click', function () {
        // Step 1: Gather Input Data
        var emailTo = document.getElementById('email').value;
        var subject = document.getElementById('subject-line').value;
        var locationId = document.getElementById('location-id').value;
        var triggerType = document.getElementById('trigger-type').value;
        var inspectionType = document.getElementById('inspection-type').value;
        var userId = document.getElementById('user-id-input').value;
        var workflowName = document.getElementById('workflow-name').value;
        var fieldName = document.getElementById('field-name').value;
        var fieldOption = document.getElementById('field-option').value;
        var fieldType = document.getElementById('field-type').value;

        // Step 2: Construct Criteria Object
        var criteria = {};

        if (locationId) {
            criteria["location_id"] = locationId;
        }

        if (triggerType === 'damage') {
            criteria["damage"] = true;
        } else if (triggerType === 'user-id' && userId) {
            criteria["user_id"] = userId;
        } else if (triggerType === 'checklist-field') {
            var checklistFieldKey = `notations.${workflowName}.${fieldName}`;
            if (fieldType === 'checkbox') {
                criteria[`${checklistFieldKey}.${fieldOption}`] = { "$contains": "True" };
            } else {
                criteria[checklistFieldKey] = fieldOption;
            }
        }

        switch (inspectionType) {
            case 'all-types':
                criteria["$or"] = [{ "check_in": false }, { "check_in": true }, { "check_in": null }];
                break;
            case 'return-only':
                criteria["check_in"] = true;
                break;
            case 'update-only':
                criteria["check_in"] = "null";
                break;
            case 'checkout-only':
                criteria["check_in"] = false;
                break;
            case 'return-update':
                criteria["$or"] = [{ "check_in": true }, { "check_in": "null" }];
                break;
            case 'return-checkout':
                criteria["$or"] = [{ "check_in": false }, { "check_in": true }];
                break;
            case 'update-checkout':
                criteria["$or"] = [{ "check_in": false }, { "check_in": "null" }];
                break;
        }

        // Step 3: Format JSON Output
        var template = [
            {
                "criteria": criteria,
                "email": {
                    "to": emailTo,
                    "subject": subject
                }
            }
        ];

        // Step 4: Generate and Download File
        downloadJSONAsTextFile(template, 'emailTemplate.txt');
    });

    function downloadJSONAsTextFile(jsonData, filename) {
        const text = JSON.stringify(jsonData, null, 2); // Using null and 2 for formatting
        const element = document.createElement('a');
        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
        element.setAttribute('download', filename);
        element.style.display = 'none';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    }


    var triggerTypeSelect = document.getElementById('trigger-type');
    var checklistOptionsInfo = document.getElementById('checklist-options-info');
    var fieldTypeGroup = document.getElementById('field-type-group');

    triggerTypeSelect.addEventListener('change', function () {
        if (this.value === 'checklist-field') {
            checklistOptionsInfo.style.display = 'block'; // Show the Checklist Options Info
            fieldTypeGroup.style.display = 'flex'; // Show the Field Type dropdown
        } else {
            checklistOptionsInfo.style.display = 'none'; // Hide the Checklist Options Info
            fieldTypeGroup.style.display = 'none'; // Hide the Field Type dropdown
        }
    });

    var userIDInfo = document.getElementById('user-id-info');
    var UserIDGroup = document.getElementById('user-id-group');

    triggerTypeSelect.addEventListener('change', function () {
        if (this.value === 'user-id') {
            userIDInfo.style.display = 'block'; // Show the Checklist Options Info
            UserIDGroup.style.display = 'flex'; // Show the Field Type dropdown
        } else {
            userIDInfo.style.display = 'none'; // Hide the Checklist Options Info
            UserIDGroup.style.display = 'none'; // Hide the Field Type dropdown
        }
    });

    const templateInput = document.getElementById('template-line');
    const subjectInput = document.getElementById('subject-line');
    const datalist = document.getElementById('template-lines');

    templateInput.addEventListener('input', function () {
        const searchTerm = this.value;
        fetchEmailTemplates(searchTerm, function (templates) {
            datalist.innerHTML = '';
            templates.forEach(template => {
                const option = document.createElement('option');
                option.value = template;
                datalist.appendChild(option);
            });
        });
    });

    templateInput.addEventListener('change', function () {
        const selectedTemplate = emailTemplatesGlobal.find(t => t.name === this.value);
        if (selectedTemplate) {
            subjectInput.value = selectedTemplate.subject;
        }
    });

    document.getElementById('bulk-create').addEventListener('click', function () {
        // Select the elements that you want to hide
        const elementsToHide = document.querySelectorAll('.form-group:not(#bulk-create-section), #create-quick-template');

        // Hide the elements
        elementsToHide.forEach(element => {
            element.style.display = 'none';
        });

        document.querySelector('h1').textContent = 'Create Email Templates in Bulk';

        // Show the bulk create section
        const bulkCreateSection = document.getElementById('bulk-create-section');
        bulkCreateSection.style.display = 'block';

        // Hide the 'Create Email Templates in Bulk' button
        this.style.display = 'none';

        // Create the 'Quick Create Email Template' button if it does not exist
        if (!document.getElementById('quick-create')) {
            const quickCreateBtn = document.createElement('button');
            quickCreateBtn.id = 'quick-create';
            quickCreateBtn.textContent = '< Back to Quick Create';
            quickCreateBtn.addEventListener('click', function () {
                // Show the elements
                elementsToHide.forEach(element => {
                    element.style.display = 'flex';
                });

                document.querySelector('h1').textContent = 'Quick Create Email Template';

                // Hide the bulk create section
                bulkCreateSection.style.display = 'none';

                // Show the 'Create Email Templates in Bulk' button
                document.getElementById('bulk-create').style.display = 'block';

                // Remove the 'Quick Create Email Template' button
                this.remove();
            });

            // Insert the new button before the bulk create section
            bulkCreateSection.parentNode.insertBefore(quickCreateBtn, bulkCreateSection);
        }
    });

    // Add an event listener to the file input element
    document.getElementById('file-input').addEventListener('change', function (event) {
        var file = event.target.files[0];
        readFile(file);
    });

    // Modify the readFile function to process the spreadsheet
    function readFile(file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            // Process the workbook to create email templates
            const emailTemplates = processWorkbook(workbook);
            document.getElementById('process-file').jsonData = emailTemplates;
        };
        reader.readAsArrayBuffer(file);
    }

    // Add a new function to process the workbook
    function processWorkbook(workbook) {
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 }); // Read rows as arrays
        let templates = [];

        // Start from the 3rd row (index 2), as the first two rows are labels
        for (let i = 2; i < rows.length; i++) {
            let row = rows[i];
            if (row && row[0]) {
                let template = createEmailTemplateFromRow(row);
                templates.push(template);
            }
        }
        return templates;
    }

    // Create an email template from a row of the spreadsheet
    function createEmailTemplateFromRow(row) {
        // Extract data from row
        var emailTo = row[0]; // Email(s) (Column A)
        var subject = row[1]; // Subject Line (Column B)
        var locationId = row[2]; // Location ID (Column C)
        var triggerType = row[3]; // Trigger Type (Column D)
        var inspectionType = row[4]; // Inspection Type (Column E)
        var userId = row[5]; // User ID (Column F)
        var fieldType = row[6]; // Field Type (Column G)
        var workflowName = row[7]; // Workflow Name (Column H)
        var fieldName = row[8]; // Field Name (Column I)
        var fieldOption = row[9]; // Field Option (Column J)

        // Construct Criteria Object
        var criteria = {};

        if (locationId) {
            criteria["location_id"] = locationId;
        }

        if (triggerType === 'Damage') {
            criteria["damage"] = true;
        } else if (triggerType === 'User ID' && userId) {
            criteria["user_id"] = userId;
        } else if (triggerType === 'Checklist Field') {
            var checklistFieldKey = `notations.${workflowName}.${fieldName}`;
            if (fieldType === 'Checkbox') {
                criteria[`${checklistFieldKey}.${fieldOption}`] = { "$contains": "True" };
            } else {
                criteria[checklistFieldKey] = fieldOption;
            }
        }

        switch (inspectionType) {
            case 'All Types':
                criteria["$or"] = [{ "check_in": false }, { "check_in": true }, { "check_in": null }];
                break;
            case 'Return Only':
                criteria["check_in"] = true;
                break;
            case 'Update Only':
                criteria["check_in"] = "null";
                break;
            case 'Checkout Only':
                criteria["check_in"] = false;
                break;
            case 'Return & Update Only':
                criteria["$or"] = [{ "check_in": true }, { "check_in": "null" }];
                break;
            case 'Return & Checkout Only':
                criteria["$or"] = [{ "check_in": false }, { "check_in": true }];
                break;
            case 'Update & Checkout Only':
                criteria["$or"] = [{ "check_in": false }, { "check_in": "null" }];
                break;
        }

        // Return the email template object
        return {
            "criteria": criteria,
            "email": {
                "to": emailTo,
                "subject": subject
            }
        };
    }

    document.getElementById('open-spreadsheet').addEventListener('click', function () {
        window.open('https://docs.google.com/spreadsheets/d/1lg1Y1ewiOuI3Mm1fJHof063flIBfavdyxEv18kNad3w/copy', '_blank');
    });
});

let emailTemplatesGlobal = [];

function fetchEmailTemplates(searchTerm, callback) {
    const query = `
        {
            emailTemplates(first: 20, name: "${searchTerm}") {
                edges {
                    node {
                        name
                        subject
                    }
                }
            }
        }
    `;

    fetch('https://api.record360.com/v2', {
        method: 'POST',
        headers: {
            'Authorization': 'Token eyJraWQiOiJwU0J5ZER6TVdoVVRJeUpQY1VQNjRnIiwiYWxnIjoiUlMyNTYifQ.eyJzdWIiOiI1MTc3NSIsImlhdCI6MTcwNDk5NjQ4OH0.k81_vS3yi_a2yyx3szi2SpqhgSVuabmcqab6yx_LCY5XQX9SFp2HhRkFMpumqEFN6RpqUKQwfsoQXrpMIUXa2yamlS6Qal1ognhLy4oKg8ed41gn7iEutnJb1L36EWVkUdu1swef6yvRa1L0kcn7Zuey-NVOpFsmx_KoUlplZh-8oTVftZzN3kYzbGdcMZnds3rBzPw_DduM5BWTXsha6c6niQf9H9oJvdhy3Vpaxa0bynwwjSAzdAYur5hwGoNviyg2jK7veR3kDWBVgqFl5AGomVDL2wQqUmdAwPsm3A2cIuAv9RkoOc9Q7KtPDxNhTYf9GTaHSYyUVQ-UnbiOkw',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query: query })
    })
        .then(response => response.json())
        .then(data => {
            emailTemplatesGlobal = data.data.emailTemplates.edges.map(edge => ({
                name: edge.node.name,
                subject: edge.node.subject
            }));
            callback(emailTemplatesGlobal.map(template => template.name));
        })
        .catch(error => {
            console.error('Error fetching email templates:', error);
            callback([]);
        });
}