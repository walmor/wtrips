import React from 'react';
import PropTypes from 'prop-types';
import { toJS } from 'mobx';
import { observer } from 'mobx-react';
import moment from 'moment';
import { Table } from 'antd';

function getTableColumns(canManageUserTrips) {
  const columns = [
    {
      title: 'Destination',
      dataIndex: 'destination',
      key: 'destination',
    },
  ];

  const extraColumns = [
    {
      title: 'Start date',
      dataIndex: 'startDate',
      key: 'startDate',
      width: '17%',
      render: (text, trip) => moment(trip.startDate).format('ll'),
    },
    {
      title: 'End date',
      dataIndex: 'endDate',
      key: 'endDate',
      width: '17%',
      render: (text, trip) => moment(trip.endDate).format('ll'),
    },
    {
      title: 'Days left',
      dataIndex: 'daysLeft',
      key: 'daysLeft',
      width: '15%',
      render: (text, trip) => {
        let daysLeft = trip.daysLeft || '';
        if (daysLeft) {
          daysLeft += daysLeft === 1 ? ' day' : ' days';
        }
        return daysLeft;
      },
    },
  ];

  if (canManageUserTrips) {
    columns.push({
      title: 'Traveler',
      dataIndex: 'user',
      key: 'user',
      width: '25%',
      render: (text, trip) => trip.user.name,
    });
  }

  columns.push(...extraColumns);

  return columns;
}

const TravelPlanTable = ({
  loading, trips, canManageUserTrips, date,
}) => (
  <div className="TrabelPlanTable">
    <h1>Travel plan - {date}</h1>
    <Table
      size="middle"
      rowKey="_id"
      loading={{ delay: 500, spinning: loading }}
      locale={{ emptyText: 'No trips found' }}
      pagination={false}
      dataSource={toJS(trips)}
      columns={getTableColumns(canManageUserTrips)}
    />
  </div>
);

TravelPlanTable.propTypes = {
  loading: PropTypes.bool,
  trips: PropTypes.array,
  canManageUserTrips: PropTypes.bool,
  date: PropTypes.string.isRequired,
};

TravelPlanTable.defaultProps = {
  loading: false,
  trips: [],
  canManageUserTrips: false,
};

export default observer(TravelPlanTable);
