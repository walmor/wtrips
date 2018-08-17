import React from 'react';
import { inject, observer } from 'mobx-react';
import PropTypes from 'prop-types';
import { Radio, DatePicker, message, Button } from 'antd';
import moment from 'moment';
import ReactToPrint from 'react-to-print';
import UserSelector from './UserSelector';
import TravelPlanTable from './TravelPlanTable';

import ContentPanel from './content/ContentPanel';

const { MonthPicker } = DatePicker;
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;

const propTypes = {
  query: PropTypes.object.isRequired,
  onLoad: PropTypes.func.isRequired,
  onSearch: PropTypes.func.isRequired,
  onFilter: PropTypes.func.isRequired,
  loading: PropTypes.bool,
  error: PropTypes.string,
  trips: PropTypes.array,
  canManageUserTrips: PropTypes.bool.isRequired,
  userSelector: PropTypes.object.isRequired,
};

const defaultProps = {
  loading: false,
  error: null,
  trips: [],
};

class TripPlan extends React.Component {
  async componentDidMount() {
    this.props.onLoad();
    this.thisMonth = moment().startOf('month');
  }

  componentDidUpdate(prevProps) {
    const { error } = this.props;
    if (!prevProps.error && error) {
      message.error(error);
    }
  }

  handleUserFilterChanged = (input) => {
    this.props.onFilter({ user: input.target.value });
  };

  handleMonthFilterChanged = (date) => {
    this.props.onFilter({ month: date.month() + 1, year: date.year() });
  };

  isDateDisabled = date => date.isBefore(this.thisMonth);

  render() {
    const {
      loading, trips, query, canManageUserTrips, userSelector,
    } = this.props;

    const tableProps = {
      loading,
      canManageUserTrips,
      trips,
      date: query.monthFilter.format('MMM, YYYY'),
    };

    const userFilter = query.user || 'all';

    return (
      <ContentPanel>
        <div className="UserList">
          <div className="TravelPlanFilterPanel">
            <div>
              <ReactToPrint
                trigger={() => <Button type="primary">Print</Button>}
                content={() => this.tableToPrint}
              />
            </div>
            <div>
              {canManageUserTrips && (
                <React.Fragment>
                  <RadioGroup
                    className="u-marginRight"
                    value={userFilter}
                    onChange={this.handleUserFilterChanged}
                  >
                    <RadioButton value="all">All trips</RadioButton>
                    <RadioButton value="me">My trips</RadioButton>
                  </RadioGroup>
                  <UserSelector className="u-marginRight" {...userSelector.mappedProps} />
                </React.Fragment>
              )}
              <MonthPicker
                className="TravelPlanMonthFilter"
                allowClear={false}
                placeholder="Month"
                disabledDate={this.isDateDisabled}
                value={query.monthFilter}
                format="MMM, YYYY"
                onChange={date => this.handleMonthFilterChanged(date)}
              />
            </div>
          </div>
          <TravelPlanTable
            {...tableProps}
            ref={(el) => {
              this.tableToPrint = el;
            }}
          />
        </div>
      </ContentPanel>
    );
  }
}

TripPlan.propTypes = propTypes;
TripPlan.defaultProps = defaultProps;

function mapStateToProps(s) {
  const { travelplan: tp, auth } = s.appStore;
  return {
    query: tp.query,
    onLoad: () => tp.load(),
    onSearch: search => tp.search(search),
    onFilter: data => tp.filter(data),
    loading: tp.loading,
    error: tp.error,
    trips: tp.trips,
    canManageUserTrips: auth.canManageUserTrips,
    userSelector: tp.userSelector,
  };
}

export default inject(mapStateToProps)(observer(TripPlan));
