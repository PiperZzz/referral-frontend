import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Typography, Space, message, Modal } from 'antd';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';

const { Title } = Typography;

interface ResetPasswordFormData {
  newPassword: string;
  confirmPassword: string;
}

const ResetPassword: React.FC = () => {
  const [form] = Form.useForm();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [resetToken, setResetToken] = useState<string | null>(null);

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      message.error('Invalid reset link');
      navigate('/forget-password');
      return;
    }
    setResetToken(token);
  }, [searchParams, navigate]);

  const onFinish = async (values: ResetPasswordFormData) => {
    if (!resetToken) {
      message.error('Invalid reset token');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const response = await authAPI.resetPassword(resetToken, values.newPassword);
      
      if (response.success) {
        setIsModalVisible(true);
        form.resetFields();
      } else {
        message.error(response.message || 'Failed to reset password');
      }
    } catch (error: any) {
      let errorMessage = 'Failed to reset password';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 400) {
        errorMessage = 'Invalid or expired reset token';
      }
      
      message.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      {/* Top right navigation */}
      <div className="absolute top-6 right-6">
        <Space size={16}>
          <Link 
            to="/login"
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Login
          </Link>
          <Link 
            to="/help"
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Help
          </Link>
        </Space>
      </div>

      {/* Main content */}
      <div className="w-full max-w-sm mx-auto">
        {/* Title */}
        <div className="text-center mb-12">
          <Title 
            level={1} 
            className="text-4xl font-normal text-gray-900 mb-0"
            style={{ fontWeight: 400, fontSize: '2.5rem', marginBottom: 0 }}
          >
            MOYI Referral
          </Title>
        </div>

        {/* Reset Password Form */}
        <Form
          form={form}
          name="resetPassword"
          onFinish={onFinish}
          layout="vertical"
          autoComplete="off"
          className="space-y-6"
        >
          {/* New Password Field */}
          <Form.Item
            name="newPassword"
            label={
              <span className="text-sm text-gray-700 font-normal">
                New Password:
              </span>
            }
            rules={[
              { required: true, message: 'Please enter your new password' },
              { min: 6, message: 'Password must be at least 6 characters' },
            ]}
            className="mb-6"
          >
            <Input.Password
              placeholder=""
              className="h-12 border-gray-300 rounded-none border-2 focus:border-gray-400 hover:border-gray-400"
              style={{
                borderRadius: 0,
                boxShadow: 'none',
              }}
            />
          </Form.Item>

          {/* Confirm Password Field */}
          <Form.Item
            name="confirmPassword"
            label={
              <span className="text-sm text-gray-700 font-normal">
                Confirm Password:
              </span>
            }
            dependencies={['newPassword']}
            rules={[
              { required: true, message: 'Please confirm your password' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Passwords do not match'));
                },
              }),
            ]}
            className="mb-8"
          >
            <Input.Password
              placeholder=""
              className="h-12 border-gray-300 rounded-none border-2 focus:border-gray-400 hover:border-gray-400"
              style={{
                borderRadius: 0,
                boxShadow: 'none',
              }}
            />
          </Form.Item>

          {/* Action Buttons */}
          <div className="flex justify-center space-x-4">
            <Button
              type="default"
              htmlType="submit"
              loading={isSubmitting}
              disabled={!resetToken}
              className="h-12 px-8 border-2 border-gray-300 rounded-none bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-400 disabled:bg-gray-100 disabled:text-gray-400"
              style={{
                borderRadius: 0,
                fontWeight: 'normal',
              }}
            >
              {isSubmitting ? 'Resetting...' : 'Submit'}
            </Button>
            
            <Link to="/login">
              <Button
                type="default"
                className="h-12 px-8 border-2 border-gray-300 rounded-none bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-400"
                style={{
                  borderRadius: 0,
                  fontWeight: 'normal',
                }}
              >
                Cancel
              </Button>
            </Link>
          </div>
        </Form>

        {/* Success Modal */}
        <Modal
          title="Password Reset Successful"
          open={isModalVisible}
          onCancel={handleModalClose}
          footer={[
            <Button 
              key="login" 
              type="default"
              onClick={handleModalClose}
              className="h-10 px-6 border-2 border-gray-300 rounded-none bg-white text-gray-700 hover:bg-gray-50"
              style={{ borderRadius: 0 }}
            >
              Login
            </Button>
          ]}
          centered
        >
          <div className="py-4">
            <p className="text-gray-700 mb-4">
              Your password has been reset successfully.
            </p>
            <p className="text-gray-600 text-sm">
              You can now login with your new password.
            </p>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default ResetPassword;