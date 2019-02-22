export const milestoneTypeArray = [
    {
        text: 'INVOICE',
        value: 'invoice'
    },
    {
        text: 'CUST DRAWING',
        value: 'CUSTOMER DRAWING'
    },
    {
        text: 'LETTER',
        value: 'LETTER'
    },
    {
        text: 'TAB DATA',
        value: 'TAB DATA'
    },
    {
        text: 'CSA',
        value: 'agreement'
    },
    {
        text: 'MCSA',
        value: 'modifiedAgreement'
    },
    {
        text: 'MA',
        value: 'masterAgreement'
    },
    {
        text: 'CA',
        value: 'clientAgreement'
    },
    {
        text: 'PO',
        value: 'purchaseOrder'
    },
    {
        text: 'SCOPE PLANNING',
        value: 'scopePlannings'
    }
];

export const CSA_FORM_ARRAY = [
    {
        checked: false,
        checkBoxTitle: 'Shoring Near Buildings',
        titleLabel: 'Shoring Title',
        textLabel: 'Shoring Text',
        title: 'Shoring Near Buildings',
        text: 'Client agrees that Consultant shall prepare a shoring system that will provide a safe working area for personnel, capable of supporting estimated surcharge loading from adjacent building structure(s).  However, Client understands and takes full responsibility and liability for the fact that during shoring installation, removal, deflection or other construction activities, damage or settlement may occur to the adjacent soils and building structure.   Therefore, client agrees to defend, indemnify and hold harmless Consultant against any and all claims and liability related to damage, settlement or cracking of any kind that occur to existing building structures, soils, footings, slabs or utilities due to shoring installation, removal, deflection, or construction operations',
        rows: 7,
        textTitle: 'shoring',
        checkboxField: 'hasShoring',
        titleField: 'shoringTitle'

    },
    {
        checked: false,
        checkBoxTitle: 'EOR for Equipment Support',
        titleLabel: 'Equipment Support Title',
        textLabel: 'Equipment Support Text',
        title: 'EOR for Equipment Support',
        text: 'Unless requested and approved under a separate consulting services agreement, the Consultant shall not be responsible for performing any checks or analysis of the existing building structural elements to support the loads imposed upon it by the equipment outlined in the scope of services.  The engineer of record (EOR) for the building must review the new equipment and confirm, in writing, that the existing building structure is adequate to support the imposed loads.  Any changes to the engineered system that occur after the EOR review may be viewed as additional scope of work, and any retrofit of the building structure deemed necessary by EOR is the responsibility of Client.',
        rows: 7,
        textTitle: 'equipmentSupport',
        checkboxField: 'hasEquipmentSupport',
        titleField: 'equipmentSupportTitle'
    },
    {
        checked: false,
        checkBoxTitle: 'EOR for Structural Shoring',
        titleLabel: 'Structural Shoring Title',
        textLabel: 'Structural Shoring Text',
        title: 'EOR for Structural Shoring',
        text: 'Unless requested and approved under a separate consulting services agreement, the Consultant shall not be responsible for performing any checks or analysis of the existing building structural elements to support the loads imposed upon them, or to be supported at locations shown during any phase of work.  The engineer of record (EOR) for the building must review proposed shoring system, and provide in writing, that the existing building structure is adequate to undergo construction and shoring operations.  Any changes to the engineered system that occur after the EOR review may be viewed as additional scope of work, and any retrofit of the building structure deemed necessary by EOR is the responsibility of Client.',
        rows: 7,
        textTitle: 'structuralShoring',
        checkboxField: 'hasStructuralShoring',
        titleField: 'structuralShoringTitle'
    },
    {
        checked: true,
        checkBoxTitle: 'Fee',
        titleLabel: 'Fee Title',
        textLabel: 'Fee Text',
        title: 'FEE',
        text: 'The fee shall be paid within 30 days after the Client receives the Consultant’s submittal of the work product described in the Scope of Services.  Any additional work, including changes, site inspections/meetings or addressing review comments, will be performed either on a time and material basis at $240 per hour for Principal/Senior Engineer, $210 per hour for staff engineer and $110 per hour for AutoCAD drafting or a negotiated fee.  All outstanding balances remaining unpaid 45 days after the due date shall be subject to interest at the rate of two percent (2%) per month, starting from the due date and continuing until paid in full.  If outstanding balance is not paid after 100 days, the account will be subject to additional fees incurred by the employment of an outside collection agency, including attorney fees.  The Consultant’s liability on this project is limited to the amount of the fee invoiced by the Consultant as described in this section.  To the fullest extent permitted by law, Client shall indemnify, defend, and hold Consultant harmless from and against any and all claims, damages, costs, liabilities, losses, expenses, including reasonable attorneys’ fees, awards, fines or judgments for the death or bodily injury to persons, damage to property, or other loss, damage or expense (collectively “Liabilities”) arising out of or in connection with the work of improvement caused by the negligence of Client, General Contractor, the sub-contractors or their employees, agents or servants, including Consultant\'s alleged or actual negligent act or omission, provided, however, Client shall not be obligated to indemnify Consultant with respect to Liabilities resulting from Consultant’s sole negligence or willful misconduct.',
        rows: 16,
        textTitle: 'fee',
        checkboxField: 'hasFee',
        titleField: 'feeTitle'
    },
    {
        checked: false,
        checkBoxTitle: 'Two way indemnity',
        titleLabel: 'Two Way Indemnity Title',
        textLabel: 'Two Way Indemnity Text',
        title: '2 way indemnity',
        text: 'To the fullest extent permitted by law, Client shall indemnify, defend, and hold Consultant harmless from and against any and all claims, damages, costs, liabilities, losses, expenses, including reasonable attorneys’ fees, awards, fines or judgments for the death or bodily injury to persons, damage to property, or other loss, damage or expense arising out of or in connection with the work of improvement caused by the negligence or willful misconduct of Client, General Contractor, the sub-contractors or their employees, agents or servants.   In turn, Consultant shall indemnify, defend, and hold Client harmless from and against any and all claims, damages, costs, liabilities, losses, expenses, including reasonable attorneys’ fees, awards, fines or judgments for the death or bodily injury to persons, damage to property, or other loss, damage or expense arising out of or in connection with the work of improvement caused by the negligence or willful misconduct of Consultant. Notwithstanding any other provision of this indemnity or contract, nothing herein is intended to create an immediate duty to defend the other party until and unless it is established by a judicial or arbitration finding that the party from whom a defense is sought was in fact negligent in the performance of its professional services under this contract.',
        rows: 13,
        textTitle: 'indemnity',
        checkboxField: 'hasIndemnity',
        titleField: 'indemnityTitle'
    },
    {
        checked: true,
        checkBoxTitle: 'Means and Methods',
        titleLabel: 'Means Title',
        textLabel: 'Means Text',
        title: 'MEANS AND METHODS',
        text: 'Consultant will not supervise, direct, control or have authority over or be responsible for Client’s means, methods, techniques, sequences or procedures of construction, or the safety precautions and programs incident thereto, or for any failure of Client to comply with Laws and Regulations applicable to the furnishing or performance of work.',
        rows: 4,
        textTitle: 'means',
        checkboxField: 'hasMeans',
        titleField: 'meansTitle'
    },
    {
        checked: true,
        checkBoxTitle: 'Termination of Agreement',
        titleLabel: 'Termination Title',
        textLabel: 'Termination Text',
        title: 'TERMINATION OF AGREEMENT',
        text: 'This Agreement can be terminated at any time by either party, for any reason, by giving written notice to the other party.  If the Client terminates this Agreement prior to the completion of the services, the Consultant shall be reimbursed on a time and materials basis for all costs incurred up to the date of termination.',
        rows: 3,
        textTitle: 'termination',
        checkboxField: 'hasTermination',
        titleField: 'terminationTitle'
    },
    {
        checked: true,
        checkBoxTitle: 'Standerd of care',
        titleLabel: 'Standerd of care Title',
        textLabel: 'Standerd of care Text',
        title: 'STANDARD OF CARE',
        text: 'Services performed by Consultant under this Agreement will be conducted in a manner consistent with and limited to that level of care and skill ordinarily exercised by members of the profession currently practicing in the same locality under similar conditions at the time the services were provided.  No other representation, express or implied, and no warranty or guarantee is included or intended in this Agreement, or in any report opinion, document or otherwise.',
        rows: 5,
        textTitle: 'care',
        checkboxField: 'hasCare',
        titleField: 'careTitle'
    },
    {
        checked: true,
        checkBoxTitle: 'Schedule',
        titleLabel: 'Schedule Title',
        textLabel: 'Schedule Text',
        title: 'SCHEDULE',
        text: 'All design work shall be completed and submitted to Client for review within a schedule agreed upon by Client and Consultant after Consultant receives a notice to proceed.',
        rows: 2,
        textTitle: 'schedule',
        checkboxField: 'hasSchedule',
        titleField: 'scheduleTitle'
    },
    {
        checked: true,
        checkBoxTitle: 'Dispute resolution',
        titleLabel: 'Dispute Title',
        textLabel: 'Dispute Text',
        title: 'DISPUTE RESOLUTION',
        text: 'The parties shall attempt to resolve by mediation any dispute between them arising out of or relating to this Agreement or the work of improvement.  Except as to any matter that would fall within the jurisdiction of the Small Claims Court, if mediation does not resolve such dispute, it shall be submitted to binding arbitration under the Rules of the American Arbitration Association or the Judicial Arbitration and Mediation Service.  Discovery shall be allowed under the arbitration and will be conducted in accordance with California Code of Civil Procedure section 1283.05.  Judgment on the award of the arbitrator(s) may be entered in any court having jurisdiction. The prevailing party shall be entitled, in addition to any judgment or award, to its attorney\'s fees and costs incurred in such arbitration, and any related costs of enforcement of any such judgment or award, and upon any appeal thereof.  This Agreement and the arbitration shall be governed by California law.',
        rows: 7,
        textTitle: 'dispute',
        checkboxField: 'hasDispute',
        titleField: 'disputeTitle'
    },
    {
        checked: true,
        checkBoxTitle: 'Job Safety',
        titleLabel: 'Job Safety Title',
        textLabel: 'Job Safety Text',
        title: 'JOBSITE SAFETY',
        text: 'Neither the professional activities of the Consultant, nor the presence of the Consultant or its employees and sub-consultants at a construction/project site, shall relieve the General Contractor of its obligations, duties and responsibilities including, but not limited to, construction means, methods, sequence, techniques or procedures necessary for performing, superintending and coordinating the Work in accordance with the contract documents and any health or safety precautions required by any regulatory agencies.  The Consultant and its personnel have no authority to exercise any control over any construction contractor or its employees in connection with their work or any health or safety precautions.  The Client agrees that the General Contractor is solely responsible for jobsite safety, and warrants that this intent shall be carried out in the Client’s agreement with the General Contractor.',
        rows: 7,
        textTitle: 'safety',
        checkboxField: 'hasSafety',
        titleField: 'safetyTitle'
    },
    {
        checked: true,
        checkBoxTitle: 'Miscellaneous',
        titleLabel: 'Miscellaneous Title',
        textLabel: 'Miscellaneous Text',
        title: 'MISCELLANEOUS',
        text: 'If any provision of this Agreement is held invalid or unenforceable, then all other provisions of this Agreement shall remain fully valid, enforceable and binding on the parties.  Any changes to this Agreement or change orders relative to the Work shall be in writing and signed by the parties to be effective. Time is of the essence of every provision contained in this Agreement.  The waiver by either party of any breach of any provision or covenant of this Agreement shall not be deemed a waiver of any other provision or covenant.  The parties acknowledge that each party and its counsel have reviewed and revised this Agreement and that the normal rule of construction to the effect that ambiguities are to be construed against the drafting party shall not be employed in the interpretation of this Agreement or any amendment or exhibits.',
        rows: 6,
        textTitle: 'miscellaneous',
        checkboxField: 'hasMiscellaneous',
        titleField: 'miscellaneousTitle'
    }
];
