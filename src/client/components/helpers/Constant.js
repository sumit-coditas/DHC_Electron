module.exports = {
    ACCESS_LEVELS: {
        READ: 'read',
        WRITE: 'write'
    },
    PERMISSIONS: {
        MANAGE_USER: {
            NAME: 'Manage User'
        },
        MANAGE_APP: {
            NAME: 'Manage App'
        },
        MANAGE_ACCESSIBILITY: {
            NAME: 'Manage Accessibility'
        },
        MANAGE_GROUP_STATUS: {
            NAME: 'Manage Group Status'
        },
        MANAGE_PERSONAL_UPDATE: {
            NAME: 'Manage Personal Update'
        },
        MANAGE_TASK: {
            NAME: 'Manage Task'
        }
    },
    NOTIFICATION_LEVELS: {
        SUCCESS: 'success',
        ERROR: 'error',
        WARNING: 'warning',
        INFO: 'info'
    },

    NOTIFICATION_MESSAGES: {
        ROLE: {
            ADD_SUCCESS: 'Role added successfully',
            UPDATE_SUCCESS: 'Role updated successfully'
        },
        ROLE_LEVEL: {
            ADD_SUCCESS: 'Role level added successfully',
            UPDATE_SUCCESS: 'Role level updated successfully'
        },
        LOCATION: {
            ADD_SUCCESS: 'Location added successfully',
            UPDATE_SUCCESS: 'Location updated successfully'
        },
        WORKLOAD: {
            ADD_SUCCESS: 'Workload added successfully',
            UPDATE_SUCCESS: 'Workload updated successfully'
        },
        USER: {
            ADD_SUCCESS: 'User added successfully',
            UPDATE_SUCCESS: 'User updated successfully',
            EMAIL_PRESENT: 'User with this email already present'
        },
        USER_LOCATION: {
            LOCATION: {
                UPDATE_SUCCESS: 'Location updated successfully'
            },
            LOCATION_TIME: {
                UPDATE_SUCCESS: 'Location time updated successfully'
            },
            EXTENSION: {
                UPDATE_SUCCESS: 'Extension updated successfully',
                REQUIRED: 'Extension should not contain only spaces'
            }
        },
        USER_AVAILABILITY: {
            UPDATE_SUCCESS: 'User availability updated successfully',
            REQUIRED: 'User availability should not contain only spaces'
        },
        ITEM_TYPE: {
            ADD_SUCCESS: 'Item type added successfully',
            UPDATE_SUCCESS: 'Item type updated successfully'
        },
        MILESTONE_TEMPLATE: {
            ADD_SUCCESS: 'Template added successfully',
            UPDATE_SUCCESS: 'Template updated successfully',
            REQUIRED: 'Scope is required to add template'
        },
        TASK: {
            ADD_SUCCESS: 'Task added successfully',
            REMOVE_INVOICE: 'At least one scope is necessary',
            UPDATE_SUCCESS: 'Task updated successfully',
            TITLE: {
                UPDATE: 'Task title updated successfully',
                REQUIRED: 'Task title should not be empty'
            },
            CITY: {
                UPDATE: 'Task city updated successfully',
                REQUIRED: 'Task city should not be empty'
            },
            STATE: {
                UPDATE: 'Task state updated successfully',
                REQUIRED: 'Task state should not be empty'
            },
            MANAGER: {
                UPDATE: 'Task manager updated successfully'
            },
            TAG: {
                ADD_SUCCESS: 'Tag added successfully',
                DELETE_SUCCESS: 'Tag deleted successfully',
                DUPLICATE: 'Tag name already present'
            },
            CONTRACTED_HOUR: {
                REQUIRED: 'Contracted hours cannot be blank',
                POSITIVE: 'Contracted hours must be a positive value',
                MAX_VALUE: 'Contracted hours cannot be greater than 1000',
                NOT_A_NUMBER: 'Contracted hours must be a number'
            },
            REMAINING_HOUR: {
                REQUIRED: 'Remaining hours cannot be blank',
                POSITIVE: 'Remaining hours must be a positive value',
                MAX_VALUE: 'Remaining hours cannot be greater than 1000',
                NOT_A_NUMBER: 'Remaining hours must be a number'
            },
            CONTRACTOR: {
                UPDATE_WARNING: 'Please update respective folder in the ftp'
            },
            ATTACHMENTS: {
                EXIST: 'File already exist',
                UPLOADING_IN_PROGRESS: 'Existing file hasn\'t finished uploading'
            }
        },
        TASK_FILE: {
            ADD_SUCCESS: 'File added successfully',
            DELETE_SUCCESS: 'File deleted successfully'
        },
        TASK_MEMBER: {
            ADD_SUCCESS: 'Member added successfully',
            DELETE_SUCCESS: 'Member deleted successfully'
        },
        TASK_HOURTRACKER: {
            ADD_SUCCESS: 'Hour tracker added successfully',
            ADD_FAILURE: 'Unable to add hour tracker.',
            UPDATE_SUCCESS: 'Hour tracker updated successfully',
            UPDATE_FAILURE: 'Unable to update hour tracker',
            DELETE_SUCCESS: 'Hour tracker deleted successfully',
            DELETE_FAILURE: 'Unable to delete hour tracker'

        },
        TASK_GROUP: {
            ADD_SUCCESS: 'Task group added successfully',
            UPDATE_SUCCESS: 'Task group updated successfully',
            DELETE_SUCCESS: 'Task group deleted successfully'
        },
        TASK_COMMENT: {
            ADD_SUCCESS: 'Comment added successfully',
            UPDATE_SUCCESS: 'Comment updated successfully',
            DELETE_SUCCESS: 'Comment deleted successfully'
        },
        TASK_DESIGN_STATUS: {
            UPDATE_SUCCESS: 'Design status updated successfully'
        },
        TASK_ASSIGEND: {
            ADD_SUCCESS: 'Task assigned successfully',
            TASK_CONTRACT: 'Task contractor details updated successfully.'
        },
        PAY_DAY_REPORT: {
            UPDATE_SUCCESS: 'Report updated successfully.',
            UPDATE_FAILD: 'Something went wrong.'
        },
        TASK_REMAINING_HOURS: {
            ADD_SUCCESS: 'Task remaining hours added successfully'
        },
        TASK_CONTRACTED_HOURS: {
            ADD_SUCCESS: 'Task contracted hours added successfully'
        },
        TASK_FORM: {
            UPDATE_SUCCESS: 'Form updated successfully',
            DUPLICATE_PROJECT_NAME: 'Project name already exist.'
        },
        TASK_MILESTONE: {
            ADD_SUCCESS: 'Milestone added successfully',
            UPDATE_SUCCESS: 'Milestone updated successfully',
            DELETE_SUCCESS: 'Milestone deleted successfully'
        },
        TASK_SUBTASK: {
            ADD_SUCCESS: 'Subtask added successfully',
            UPDATE_SUCCESS: 'Subtask updated successfully'
        },
        PURCHASE_ORDER: {
            ADD_SUCCESS: 'PO added successfully',
            ARCHIVED: 'PO archived successfully',
            RESTORE: 'PO restored successfully',
            UPDATE_SUCCESS: 'PO updated successfully'
        },
        AGREEMENT: {
            ADD_SUCCESS: 'CSA added successfully',
            DELETE_SUCCESS: 'CSA deleted successfully',
            ARCHIVED: 'CSA archived successfully',
            RESTORE: 'CSA restored successfully',
            UPDATE_SUCCESS: 'CSA updated successfully'
        },
        MODIFIED_AGREEMENT: {
            ADD_SUCCESS: 'MCSA added successfully',
            DELETE_SUCCESS: 'MCSA deleted successfully',
            ARCHIVED: 'MCSA archived successfully',
            RESTORE: 'MCSA restored successfully',
            UPDATE_SUCCESS: 'MCSA updated successfully'
        },
        MASTER_AGREEMENT: {
            ADD_SUCCESS: 'MA added successfully',
            DELETE_SUCCESS: 'MA deleted successfully',
            ARCHIVED: 'MA archived successfully',
            RESTORE: 'MA restored successfully',
            UPDATE_SUCCESS: 'MA updated successfully'
        },
        CLIENT_AGREEMENT: {
            ADD_SUCCESS: 'CA added successfully',
            DELETE_SUCCESS: 'CA deleted successfully',
            ARCHIVED: 'CA archived successfully',
            RESTORE: 'CA restored successfully',
            UPDATE_SUCCESS: 'CA updated successfully'
        },
        INVOICE: {
            ADD_SUCCESS: 'Invoice added successfully',
            DELETE_SUCCESS: 'Invoice deleted successfully',
            ARCHIVED: 'Invoice archived successfully',
            RESTORE: 'Invoice restored successfully',
            UPDATE_SUCCESS: 'Invoice updated successfully',
            HOLD_SENT_CHANGE: 'Please choose "Y" or "N"',
            TOTAL_COST: {
                REQUIRED: 'Cost should not be empty',
                NOT_A_NUMBER: 'Cost must be a number',
                POSITIVE_VALUE: 'Cost must be a positive value'
            }
        },
        SCOPE_SELECTION: 'At least one selected scope should be there',
        DRAWING: {
            ADD_SUCCESS: 'Drawing added successfully',
            DELETE_SUCCESS: 'Drawing deleted successfully',
            ARCHIVE_SUCCESS: 'Drawing archived successfully',
            RESTORE_SUCCESS: 'Drawing restored successfully'
        },
        CUST_DRAWING: {
            ADD_SUCCESS: 'Customer Drawing added successfully',
            DELETE_SUCCESS: 'Customer Drawing deleted successfully',
            ARCHIVE_SUCCESS: 'Customer Drawing archived successfully',
            RESTORE_SUCCESS: 'Customer Drawing restored successfully'
        },
        CALC: {
            ADD_SUCCESS: 'Calc added successfully',
            DELETE_SUCCESS: 'Calc deleted successfully',
            ARCHIVE_SUCCESS: 'Calc archived successfully',
            RESTORE_SUCCESS: 'Calc restored successfully'
        },
        LETTER: {
            ADD_SUCCESS: 'Letter added successfully',
            DELETE_SUCCESS: 'Letter deleted successfully',
            ARCHIVE_SUCCESS: 'Letter archived successfully',
            RESTORE_SUCCESS: 'Letter restored successfully'
        },
        TAB_DATA: {
            ADD_SUCCESS: 'Tab data added successfully',
            DELETE_SUCCESS: 'Tab data deleted successfully',
            ARCHIVE_SUCCESS: 'Tab data archived successfully',
            RESTORE_SUCCESS: 'Tab data restored successfully'
        },
        SCOPE: {
            ASSIGNED: {
                ENGINEER: 'New engineer assigned successfully',
                DRAFTER: 'New drafter assigned successfully'
            },
            NOTE: {
                UPDATE: 'Scope note updated successfully',
                REQUIRED: 'Scope note should not be empty',
                LENGTH: 'Scope note should not be greater than 16 characters'
            },
            PRICE: {
                UPDATE: 'Scope cost updated successfully',
                REQUIRED: 'Scope cost should not be empty',
                NOT_A_NUMBER: 'Scope cost must be a number',
                POSITIVE_VALUE: 'Scope cost must be a positive number',
                RANGE_ERROR: 'Scope cost should be 0 or greater'
            },
            URGENT_HOURS: {
                UPDATE: 'Scope urgent hours updated successfully',
                REQUIRED: 'Scope urgent hours should not be empty',
                NOT_A_NUMBER: 'Scope urgent hours must be a number',
                RANGE_ERROR: 'Scope urgent hours should be positive and less than 1000'
            },
            NON_URGENT_HOURS: {
                UPDATE: 'Scope non urgent hours updated successfully',
                REQUIRED: 'Scope non urgent hours should not be empty',
                NOT_A_NUMBER: 'Scope non urgent hours must be a number',
                RANGE_ERROR: 'Scope non urgent hours should be positive and less than 1000'
            },
            GROUP_CHANGE: 'Scope group changed successfully',
            HOUR_TRACKER: {
                HOURS_SPENT: {
                    REQUIRED: 'Hours spent should not be empty',
                    NOT_A_NUMBER: 'Hours spent must be a number',
                    RANGE_ERROR: 'Hours spent should be positive and less than 1000'
                },
                NOTES: {
                    NO_SPACES: 'Hour Tracker notes should not contain only spaces'
                }
            },
            ARCHIVED: {
                TRUE: 'Scope archived successfully',
                FALSE: 'Scope restored successfully'
            },
            ENGINEER: {
                STATUS: {
                    UPDATE: 'Engineer status updated successfully'
                }
            },
            DRAFTER: {
                STATUS: {
                    UPDATE: 'Drafter status updated successfully'
                }
            },
            DUE_DATE: {
                UPDATE: 'Due date updated successfully'
            },
            NOT_ALLOWED: 'Not Allowed',
            ADDITIONAL_NOTES: {
                UPDATE_SUCCESS: 'Scope additional notes updated successfully'
            },
            STATUS: {
                UPDATE: 'Scope status updated successfully',
                RANGE: 'Scope status should be positive and less than 100',
                NOT_A_NUMBER: 'Scope status should be a number'
            },
            PO: {
                UPDATE: 'Scope PO updated successfully',
                RANGE: 'Scope status should be positive and six digits only',
                NOT_A_NUMBER: 'Scope status should be a number'
            },
            INVOICE_NUMBER: {
                UPDATE: 'Scope Invoice Number updated successfully',
                ADD: 'Scope Invoice added successfully',
                DELETE: 'Scope Invoice deleted successfully'
            },
            BILLED: {
                UPDATE: 'Scope billed amount changed successfully',
                NOT_A_NUMBER: 'Scope billed amount should be a number',
                RANGE: 'Scope billed amount should not be less than zero'
            }
        },
        ADMIN_PAGE: {
            HOLD_STATUS: 'Hold status updated successfully',
            SENT_STATUS: 'Sent status updated successfully',
            PAID_STATUS: 'Paid status updated successfully',
            COST: 'Cost updated successfully',
            REMOVE: 'Invoice removed successfully'

        },
        NOTIFICATION_MESSAGE: 'The server encountered an error processing the request. Please try again, Sorry for the trouble.',
        NOTIFICATION_ERROR: 'The error request has been taken into consideration and sent to the developer.',
        USER_NOT_PRESENT: 'User is not present',
        TIMESHEET: {
            REMOVE_ROW: 'At least one timesheet entry is required'
        }
    },
    ITEM_TYPES: {
        TASK: 'task'
    },
    ROLE_ID: {
        ENGINEER: 'BkZIrmetl',
        DRAFTER: 'SJiAcXM8x',
        MANAGER: 'H1xYR4VYx',
        ADMIN: 'HJFINQKHx',
        CUSTOMER: 'C0C0aQYUV9FcOQvv1XO'
    },
    TASK_GROUP_ID: {
        ACTIVE_PROJECTS: 'BkeEu11Jb',
        ON_HOLD: 'H1shXWJyW',
        TASKS: 'B1tKksrJb',
        BIDS: 'rkndUO_kW',
        COMPLETED_PROJECTS: 'HJVcLOOyb'
    },
    TASK_GROUP__ID: {
        ACTIVE_PROJECTS: '58bed83e62b976001126f7a6',
        ON_HOLD: '58bed84862b976001126f7a7',
        TASKS: '58bed84f62b976001126f7a8',
        BIDS: '590241226a30630011b82056',
        COMPLETED_PROJECTS: '5907701d219b330011d09bca'
    },
    TASK_GROUP_ARRAY: [
        '58bed83e62b976001126f7a6',
        '58bed84862b976001126f7a7',
        '58bed84f62b976001126f7a8',
        '590241226a30630011b82056',
        '5907701d219b330011d09bca'
    ],

    COOKIES: {
        AUTH_TOKEN: 'AUTH_TOKEN',
        OFFICE_ACCESS_TOKEN: 'OFFICE_ACCESS_TOKEN',
        OFFICE_REFRESH_TOKEN: 'OFFICE_REFRESH_TOKEN',
        SLACK_ACCESS_TOKEN: 'SLACK_ACCESS_TOKEN'
    },
    DOCUMENT_TYPES: {
        PURCHASE_ORDER: 'PO',
        CUSTOMER_SERVICE_AGREEMENT: 'CSA',
        MODIFIED_CUSTOMER_SERVICE_AGREEMENT: 'MCSA',
        MODIFIED_CUSTOMER_AGREEMENT: 'MCA',
        MASTER_AGREEMENT: 'MA',
        CLIENT_AGREEMENT: 'CA',
        INVOICE: 'Invoice',
        DRAWING: 'Drawing',
        CALC: 'Calc',
        SCOPE_INVOICE: 'Scope Invoice',
        CUST_DRAWING: 'Cust Drawing',
        LETTER: 'Letter',
        TAB_DATA: 'Tab Data'
    },
    DOC_TYPES: {
        PURCHASE_ORDER: {
            type: 'purchaseOrder',
            title: 'PO'
        },
        CUSTOMER_SERVICE_AGREEMENT: {
            type: 'agreement',
            title: 'CSA'
        },
        MODIFIED_CUSTOMER_SERVICE_AGREEMENT: {
            type: 'modifiedAgreement',
            title: 'MCSA'
        },
        MASTER_AGREEMENT: {
            type: 'masterAgreement',
            title: 'MA'
        },
        CLIENT_AGREEMENT: {
            type: 'clientAgreement',
            title: 'CA'
        },
        INVOICE: {
            type: 'invoice',
            title: 'Invoice'
        },
        DRAWINGS: {
            type: 'drawing',
            title: 'Drawing Rev'
        },
        CALCS: {
            type: 'calc',
            title: 'Calc Rev'
        },
        SCOPE: {
            type: 'scope',
            title: 'Scope'
        },
        LETTER: {
            type: 'letter',
            title: 'Letter'
        },
        CUST_DRAWING: {
            type: 'custDrawing',
            title: 'Cust. Dwg Rev'
        },
        TAB_DATA: {
            type: 'tabData',
            title: 'Tab Data'
        },
        SCOPE_KEYWORD: {
            type: 'scopeKeyword',
            title: 'Keywords'
        },
        SCOPE_PLANNING: {
            type: 'scopePlanning',
            title: 'Scope Planning'
        },
        TAGS: {
            type: 'tags',
            title: 'TAGS'
        }
    },
    DRAWING_TEMPLATES: [
        {
            title: 'In drafting',
            isDone: false,
            isAttachment: false
        }, {
            title: 'Draft complete',
            isDone: false,
            isAttachment: false
        }, {
            title: 'To customer for review',
            isDone: false,
            isAttachment: false
        }, {
            title: 'Customer comments',
            isDone: false,
            isAttachment: false
        }, {
            title: 'Approved by customer',
            isDone: false,
            isAttachment: false
        }, {
            title: 'Submitted',
            isDone: false,
            isAttachment: false
        }
    ],
    CALC_TEMPLATES: [
        {
            title: 'In progress',
            isDone: false,
            isAttachment: false
        }, {
            title: 'Completed',
            isDone: false,
            isAttachment: false
        }, {
            title: 'Stamped',
            isDone: false,
            isAttachment: false
        }, {
            title: 'Submitted',
            isDone: false,
            isAttachment: false
        }
    ],
    LETTER_TEMPLATES: [
        {
            title: 'To customer for review',
            isDone: false,
            isAttachment: false
        }, {
            title: 'Submitted',
            isDone: false,
            isAttachment: false
        }
    ],
    TAB_DATA_TEMPLATES: [
        {
            title: 'In Progress',
            isDone: false,
            isAttachment: false
        }, {
            title: 'Complete',
            isDone: false,
            isAttachment: false
        }, {
            title: 'Submitted',
            isDone: false,
            isAttachment: false
        }
    ],
    PURCAHSE_ORDER_TEMPLATES: [
        {
            title: 'Scope:',
            isDone: false,
            isAttachment: false
        },
        {
            title: 'PO requested',
            isDone: false,
            isAttachment: false
        },
        {
            title: 'Received',
            isDone: false,
            isAttachment: false
        },
        {
            title: 'PO',
            isDone: false,
            isAttachment: false
        },
        {
            title: 'Amount',
            isDone: false,
            isAttachment: false
        }
    ],
    CUSTOMER_SERVICE_AGREEMENT_TEMPLATES: [
        {
            title: 'Scope:',
            isDone: false,
            isAttachment: false
        },
        {
            title: 'Draft created',
            isDone: false,
            isAttachment: false
        },
        {
            title: 'Emailed to customer',
            isDone: false,
            isAttachment: true
        },
        {
            title: 'CSA signed',
            isDone: false,
            isAttachment: false
        }
    ],
    MODIFIED_CUSTOMER_SERVICE_AGREEMENT_TEMPLATES: [
        {
            title: 'Scope:',
            isDone: false,
            isAttachment: false
        },
        {
            title: 'Draft created',
            isDone: false,
            isAttachment: false
        },
        {
            title: 'Emailed to customer',
            isDone: false,
            isAttachment: true
        },
        {
            title: 'MCSA signed',
            isDone: false,
            isAttachment: false
        }
    ],
    MASTER_AGREEMENT_TEMPLATES: [
        {
            title: 'Scope:',
            isDone: false,
            isAttachment: false
        }, {
            title: 'Signed',
            isDone: false,
            isAttachment: false
        }
    ],
    CLIENT_AGREEMENT_TEMPLATES: [
        {
            title: 'Scope:',
            isDone: false,
            isAttachment: false
        }, {
            title: 'Signed',
            isDone: false,
            isAttachment: false
        }
    ],
    INVOICE_TEMPLATES: [
        {
            title: 'Scope:',
            isDone: false,
            isAttachment: false
        }, {
            title: 'Amount:',
            isDone: false,
            isAttachment: false
        }, {
            title: 'Draft created',
            isDone: false,
            isAttachment: false
        }, {
            title: 'Submitted to DHC accounting',
            isDone: false,
            isAttachment: false
        }, {
            title: 'On Hold',
            isDone: false,
            isAttachment: false
        }, {
            title: 'Submitted to customer',
            isDone: false,
            isAttachment: false
        }, {
            title: 'Paid',
            isDone: false,
            isAttachment: false
        }
    ],
    USER_PROFILE: {
        MENU_ITEMS: {
            DETAILS: 'Profile Details',
            TIMESHEET: 'Timesheet'
        }
    },
    STATUS_OPTIONS: [
        {
            value: '-',
            label: '-'
        },
        {
            value: 'ASAP',
            label: 'ASAP'
        },
        {
            value: 'Prelim',
            label: 'Prelim'
        },
        {
            value: 'Complete',
            label: 'Complete'
        },
        {
            value: 'Await Info',
            label: 'Await Info'
        },
        {
            value: 'Hold',
            label: 'Hold'
        },
        {
            value: 'Cancelled',
            label: 'Cancelled'
        },
        {
            value: 'In Drafting',
            label: 'In Drafting'
        }
    ],
    STATUS_OPTIONS_SEMANTIC: [
        {
            value: '-',
            text: '-'
        },
        {
            value: 'ASAP',
            text: 'ASAP'
        },
        {
            value: 'Prelim',
            text: 'Prelim'
        },
        {
            value: 'Complete',
            text: 'Complete'
        },
        {
            value: 'Await Info',
            text: 'Await Info'
        },
        {
            value: 'Hold',
            text: 'Hold'
        },
        {
            value: 'Cancelled',
            text: 'Cancelled'
        },
        {
            value: 'In Drafting',
            text: 'In Drafting'
        }
    ],
    OTHER_OPTIONS_TIMESHEET: {
        PTO: 'PTO',
        HOLIDAY: 'Holiday',
        BIDS: 'Bids',
        TASKS: 'Tasks',
        DHC: 'DHC'
    },
    SOCKET_EVENTS: {
        USER_UPDATE: 'user update',
        MANAGER_UPDATE: 'manager update',
        SCOPE_UPDATE: 'scope update',
        REV_SCOPE_CREATE: 'rev scope create',
        TASK_UPDATE: 'task update',
        TASK_CREATE: 'task create',
        ROLE_UPDATE: 'role update',
        HOURTRACKER_UPDATE: 'hourtracker update',
        MILESTONE_UPDATE: 'milestone update',
        MILESTONE_CREATE: 'milestone create',
        SCOPE_TEMPLATE_UPDATE: 'scope template update',
        ITEM_TYPE_CREATE: 'itemtype create',
        ITEM_TYPE_UPDATE: 'itemtype update',
        LOGIN: 'login',
        LOGOUT: 'logout',
        USER_SINGIN: 'user singin',
        USER_SINGOUT: 'user singout',
        USERS_SINGIN: 'users singin',
        BID_SCOPE_UPDATE: 'bid scope update',
        UPDATE_USER_TOTAL_HOURS: 'update other users total urgent and non-urgent hours'
    },
    FTP_HOST_LINK: 'ftps://ftp.sd.charlesengineering.com/Projects/',
    CUSTOMER_TABLE_HEADERS: [
        {
            title: 'TG',
            sort: ''
        },
        {
            title: 'DHC Team',
            sort: ''
        },
        {
            title: 'Customer',
            sort: ''
        },
        // {
        //     title: 'Contractor',
        //     sort: 'contractor'
        // },
        {
            title: 'Job #',
            sort: 'invoiceNumber'
        },
        {
            title: 'Project Name',
            sort: 'projectName'
        },
        {
            title: 'Scope',
            sort: ''
        },
        {
            title: 'Scope Note',
            sort: ''
        },
        {
            title: 'City',
            sort: 'city'
        },
        {
            title: 'State',
            sort: 'state'
        },
        {
            title: 'Status',
            sort: 'engineerDetails.status'
        },
        {
            title: 'Due Date',
            sort: 'dueDate'
        },
        {
            title: 'Cost',
            sort: 'price'
        },
        {
            title: 'PO Number',
            sort: ''
        },
        {
            title: 'Invoiced',
            sort: ''
        },
        {
            title: 'Paid',
            sort: ''
        }
    ],
    TABLE_HEADERS: [
        {
            title: 'TG',
            sort: ''
        },
        {
            title: 'Team',
            sort: ''
        },
        {
            title: 'Contractor',
            sort: 'contractor'
        },
        {
            title: 'Job #',
            sort: 'invoiceNumber'
        },
        {
            title: 'Project',
            sort: 'projectName'
        },
        {
            title: 'Scope',
            sort: 'scopeColor'
        },
        {
            title: 'Scope Note',
            sort: ''
        },
        {
            title: 'City',
            sort: 'city'
        },
        {
            title: 'State',
            sort: 'state'
        },
        {
            title: 'Status',
            sort: 'engineerDetails.status'
        },
        {
            title: 'Completed Date',
            sort: 'dueDate'
        },
        {
            title: 'Cost',
            sort: 'price'
        },
        {
            title: 'U Hrs',
            sort: 'engineerDetails.urgentHours'
        },
        {
            title: 'NU Hrs',
            sort: 'engineerDetails.nonUrgentHours'
        },
        {
            title: 'CSA',
            sort: ''
        },
        {
            title: 'PO',
            sort: ''
        },
        {
            title: 'INV',
            sort: ''
        },
        /* {
            title: 'Final Engineering Hours',
            sort: ''
        },*/
        {
            title: 'Calc',
            sort: ''
        }
    ],
    BUCKET_NAMES: {
        PICTURE: 'dhc-pictures',
        TITLE: 'dhc-titles'
    },
    LOADER_TEXT: {
        ADD_PO: 'Adding Purchase Order',
        ADD_CSA: 'Adding Agreement',
        ADD_INVOICE: 'Adding Invoice',
        ADD_DRAWING: 'Adding Drawing',
        ADD_CALC: 'Adding Calc',
        CREATE_SCOPE: 'Creating Scope',
        CREATE_TASK: 'Creating Task',
        UPDATE_SCOPE: 'Updating Scope',
        UPDATE_TASK: 'Updating Task',
        UPDATE_HOURTRACKER: 'Updating Hourtracker',
        FETCH_ARCHIVED_DATA: 'Fetching Archived Data',
        SET_UP_FTP: 'Setting up FTP',
        LOAD_TASK: 'Loading Task'
    },
    NAV_LINK: {
        TIMESHEET: '/timesheet',
        PERSONAL_TIMESHEET: '/my-timesheet',
        ADMIN_PAGE: '/active-hold-scopes',
        COMPLETED_SCOPES: '/completed-scopes',
        CONFIG: '/role-configuration',
        USER_CONFIG: '/user-management',
        PERSONAL_CONFIG: '/personal-update',
        CUSTOMER_PROFILE: '/customer-configuration',
        APP_CONFIG: '/app-setting',
        SENT_INVOICES: '/sent-invoices',
        MY_SCOPE: '/',
        SCOPE_INVOICE: '/scope-invoice',
        CUSTOMER: '/customer-page',
        CUSTOMER_HOME: '/customer-home',
        REPORTS: '/reports'
    },
    CONFIG: {
        headers: {
            Authorization: 'Bearer ' + localStorage.getItem('AUTH_TOKEN'),
            socketID: localStorage.getItem('socketid')
        }
    },
    STRINGS: {
        addNewInvoice: 'Add Invoice to this scope.',
        totalBilled: 'Total Billed',
        contact: 'Contact',
        clientJobNo: 'Client Job No',
        clientJobNoName: 'clientJobNo',
        fee: 'Fee',
        team: 'Team',
        invoiceNumber: 'Invoice Number',
        partialBill: 'Partial Bill',
        amount: 'Amount',
        scope: 'Scope',
        selectedScope: 'Selected Scope',
        AmountEmpty: 'Amount is empty.',
        PoEmpty: 'PO is empty.',
        ADD_REV_SCOPE: 'Add new revision scope',
        archiveScope: 'Archive Scope',
        InvAmount: 'Inv. - Amount',
        Partial: 'Partial',
        FullScopeBill: 'Full Scope Bill',
        Rev: 'Rev',
        ERROR_MSG: {
            invoiceDescriptionIsMandetory: 'Scope field should not be empty.',
            amountMustBeGreaterThanZero: 'Scope amount should not be less than 0.',
            partialAmountError: 'Partial scope amount should always be less than scope price.',
            clientJobIsMandetory: 'Client job field should not be empty.',
            companyIsMandetory: 'Company field should not be empty.',
            poNumberIsMandetory: 'PO Number is required.',
            contactIsMandetory: 'Contact field should not be empty.'
        },
        Contract: {
            MA: 'MA',
            CA: 'CA',
            MCS: 'MCS',
            CSA: 'CSA'
        }
    },
    INVOICE_GROUP: {
        ACTIVE: 'Active',
        HOLD: 'Hold',
        SENT_PAID: 'Sent Paid',
        SENT_UNPAID: 'Sent Unpaid'
    },
    EDITABLE_NODES: {
        SCOPE: 'Scope:',
        AMOUNT: 'Amount:'
    },
    NON_CLICKABLE_NODES: {
        SUBMITTED_TO_DHC_ACCOUNTING: 'Submitted to DHC accounting',
        ON_HOLD: 'On Hold',
        SUBMITTED_TO_CUSTOMER: 'Submitted to customer',
        AMOUNT: 'Amount',
        SCOPE: 'Scope:',
        PO: 'PO',
        LATE: 'Late',
        PAID: 'Paid'
    },
    MILESTONE_NODES_TO_CHECK_ON_GRID: {
        CSA: {
            EMAILED: 'Emailed to customer',
            SIGNED: 'CSA signed'
        },
        MCSA: {
            EMAILED: 'Emailed to customer',
            SIGNED: 'MCSA signed'
        },
        PO: {
            RECEIVED: 'Received'
        },
        CA: {
            SIGNED: 'Signed'
        },
        MA: {
            SIGNED: 'Signed'
        }
    },
    INVOICE_NODES: {
        DRAFT_CREATED: 'Draft created',
        SCOPE: 'Scope:',
        AMOUNT: 'Amount:',
        SUBMITTED_TO_DHC_ACCOUNTING: 'Submitted to DHC accounting',
        ON_HOLD: 'On Hold'
    },
    TASK_GROUP_TITLE_ID: {
        ACTIVE_PROJECTS: { TITLE: 'ACTIVE_PROJECTS', ID: 'BkeEu11Jb', _ID: '58bed83e62b976001126f7a6' },
        ON_HOLD: { TITLE: 'ON_HOLD', ID: 'H1shXWJyW', _ID: '58bed84862b976001126f7a7' },
        TASKS: { TITLE: 'TASKS', ID: 'B1tKksrJb', _ID: '58bed84f62b976001126f7a8' },
        BIDS: { TITLE: 'BIDS', ID: 'rkndUO_kW', _ID: '590241226a30630011b82056' },
        COMPLETED_PROJECTS: { TITLE: 'COMPLETED_PROJECTS', ID: 'HJVcLOOyb', _ID: '5907701d219b330011d09bca' }
    },
    LOCALSTORAGE_KEY: {
        MANUAL_SORT: 'manualSortedScopes'
    },
    SCOPE_HIGHLIGHTERS: [
        { descValue: 4, intValue: 0, text: 'Red', label: 'Red', value: '#F2DCDB' },
        { descValue: 1, intValue: 3, text: 'Blue', label: 'Blue', value: '#C6D2F3' },
        { descValue: 2, intValue: 2, text: 'Default', label: 'Default', value: 'NONE' },
        { descValue: 0, intValue: 4, text: 'Green', label: 'Green', value: '#92D050' },
        { descValue: 3, intValue: 1, text: 'Yellow', label: 'Yellow', value: '#FFFF00' }
    ],
    SCOPE_HIGHLIGHT_COLOR: {
        RED: '#F2DCDB',
        BLUE: '#C6D2F3',
        NONE: 'none',
        GREEN: '#92D050',
        YELLOW: '#FFFF00'
    },
    SCOPE_PERMISSION_OPTIONS: [
        'Manager',
        'Engineer',
        'Drafter',
        'Admin/AP'
    ]
};
