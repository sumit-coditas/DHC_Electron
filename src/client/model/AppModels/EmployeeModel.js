import { BaseModel } from ".././BaseModel";
import cloneDeep from 'lodash/cloneDeep';
import { forEach } from 'lodash/forEach';

export class EmployeeModel extends BaseModel {
    static resource = 'employee';

    constructor(properties) {
        super(properties);
    }

    getStoreKey() {
        return `${this.resource}${(this.props)._id}`;
    }

    static getEmployeeById(_id) {
        return cloneDeep(this.get(_id));
    }

    static updateEmployee(data) {
        const employeeInstance = this.getEmployeeById(data._id);
        if (!employeeInstance) return;
        let employee = employeeInstance.props;
        new EmployeeModel({ ...employee, ...data }).$save();
    }

    static updateMultipleEmployeesOnlineStatus(data) {
        const employees = data.map(item => {
            let employeeInstance = this.getEmployeeById(item)
            if (employeeInstance)
                return employeeInstance.props
            return null
        }).filter(f => f);
        EmployeeModel.saveAll(employees.map(employee => new EmployeeModel({ ...employee, isOnline: true }).$save()))
    }

}