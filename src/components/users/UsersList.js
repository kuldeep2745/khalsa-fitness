import React, { useEffect, useContext, useState } from 'react';
import { MyContext } from '../../MyContext';
import axios from 'axios';
import { Button, Alert, Modal, Form } from 'react-bootstrap';

const UsersList = () => {
  const { userList, setUserList, token } = useContext(MyContext);
  const [successMessage, setSuccessMessage] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editedUser, setEditedUser] = useState({});
  const [editFormData, setEditFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    location: '',
  });

  useEffect(() => {
    const authConfig = {
      method: 'get',
      url: 'http://localhost:3000/users',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    axios(authConfig)
      .then((result) => {
        setUserList(result?.data); // Wrap the result in an array
      })
      .catch((error) => {
        console.error('Error fetching user:', error);
      });
  }, [setUserList, token]);

  const handleDelete = (userId, userName) => {
    // Delete user by ID
    axios
      .delete(`http://localhost:3000/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        // Remove deleted user from the user list
        setUserList((prevUsers) => prevUsers.filter((user) => user._id !== userId));
        setSuccessMessage(`${userName} deleted successfully`);

        // Clear the success message after 3 seconds
        setTimeout(() => {
          setSuccessMessage(null);
        }, 3000);
      })
      .catch((error) => {
        console.error('Error deleting user:', error);
      });
  };

  const handleEdit = (user) => {
    setEditedUser(user);
    setEditFormData({
      fullName: user.fullName,
      email: user.email,
      password: '', // Initially empty, as we don't want to display the existing password
      location: user.location,
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = () => {
    const { _id } = editedUser;
    axios
      .put(
        `http://localhost:3000/users/${_id}`,
        {
          fullName: editFormData.fullName,
          email: editFormData.email,
          password: editFormData.password,
          location: editFormData.location,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((response) => {
        // Update the user list with the edited user
        setUserList((prevUsers) =>
          prevUsers.map((user) => (user._id === _id ? { ...user, ...response.data } : user))
        );

        setSuccessMessage(`${editFormData.fullName} updated successfully`);

        // Clear the success message after 3 seconds
        setTimeout(() => {
          setSuccessMessage(null);
        }, 3000);

        // Close the modal after successful edit
        setShowEditModal(false);
      })
      .catch((error) => {
        console.error('Error editing user:', error);
      });
  };

  return (
    <div>
      {successMessage && <Alert variant="success">{successMessage}</Alert>}

      <table className="table">
        <thead>
          <tr>
            <th scope="col">S. No.</th>
            <th scope="col">User Name</th>
            <th scope="col">User Location</th>
            <th scope="col">User Email</th>
            <th scope="col">Actions</th>
          </tr>
        </thead>
        <tbody>
          {userList?.map((item, index) => (
            <tr key={index}>
              <th scope="row">{index + 1}</th>
              <td>{item.fullName}</td>
              <td>{item.location}</td>
              <td>{item.email}</td>
              <td>
                <Button variant="danger" onClick={() => handleDelete(item?._id, item?.fullName)}>
                  Delete
                </Button>{' '}
                <Button variant="primary" onClick={() => handleEdit(item)}>
                  Edit
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Edit User Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit User Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="formFullName">
              <Form.Label>Full Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter full name"
                value={editFormData.fullName}
                onChange={(e) => setEditFormData({ ...editFormData, fullName: e.target.value })}
              />
            </Form.Group>
            <Form.Group controlId="formEmail">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter email"
                value={editFormData.email}
                onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
              />
            </Form.Group>
            <Form.Group controlId="formPassword">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Enter password (optional)"
                value={editFormData.password}
                onChange={(e) => setEditFormData({ ...editFormData, password: e.target.value })}
              />
            </Form.Group>
            <Form.Group controlId="formLocation">
              <Form.Label>Location</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter location"
                value={editFormData.location}
                onChange={(e) => setEditFormData({ ...editFormData, location: e.target.value })}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            Close
          </Button>
          <Button variant="primary" onClick={handleEditSubmit}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default UsersList;
