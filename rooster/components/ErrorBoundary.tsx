import { Page } from './Page';
import * as React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }
  componentDidCatch(error, errorInfo) {
    console.log(error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <Page>
          <div className="grid grid-cols-12 w-full">
            <div className="col-span-8 lg:col-span-8 2xl:col-span-8 rounded-lg w-full">
              <h1>Something went wrong.</h1>
            </div>
          </div>
        </Page>
      );
    }
    return this.props.children;
  }
}
