// import React from "react";
// import {
//   useFormViews,
//   useDefaultFormView,
//   useCreateFormView,
//   useUpdateFormView,
//   useDeleteFormView,
// } from "../api/formViewsQueries";
// import { TableView } from "../types/interfaces/tableViews.types";

// interface FormViewsExampleProps {
//   formId: string;
// }

// /**
//  * Example component showing how to use React Query hooks for form views
//  * This demonstrates the improved developer experience compared to manual API calls
//  */
// const FormViewsExample: React.FC<FormViewsExampleProps> = ({ formId }) => {
//   // Fetch form views with built-in loading, error, and caching
//   const {
//     data: formViews,
//     isLoading: isLoadingViews,
//     error: viewsError,
//     refetch: refetchViews,
//   } = useFormViews(formId);

//   // Fetch default view
//   const {
//     data: defaultView,
//     isLoading: isLoadingDefault,
//     error: defaultError,
//   } = useDefaultFormView(formId);

//   // Mutations with optimistic updates and automatic cache invalidation
//   const createViewMutation = useCreateFormView({
//     onSuccess: (newView) => {
//       console.log("View created successfully:", newView);
//       // No need to manually refetch - React Query handles cache updates
//     },
//     onError: (error) => {
//       console.error("Failed to create view:", error);
//       // Handle error (show toast, etc.)
//     },
//   });

//   const updateViewMutation = useUpdateFormView({
//     onSuccess: (updatedView) => {
//       console.log("View updated successfully:", updatedView);
//     },
//   });

//   const deleteViewMutation = useDeleteFormView({
//     onSuccess: (viewId) => {
//       console.log("View deleted successfully:", viewId);
//     },
//   });

//   // Handle creating a new view
//   const handleCreateView = () => {
//     const newView: Omit<TableView, "_id" | "id" | "createdAt" | "updatedAt"> = {
//       name: "New View",
//       formId,
//       isPublic: false,
//       isDefault: false,
//       createdBy: "current-user@example.com", // In real app, get from auth context
//       config: {
//         columns: [],
//       },
//     };

//     createViewMutation.mutate(newView);
//   };

//   // Handle updating a view
//   const handleUpdateView = (
//     viewId: number,
//     updates: Partial<Pick<TableView, "name" | "isPublic" | "isDefault" | "config">>,
//   ) => {
//     updateViewMutation.mutate({ viewId, updates });
//   };

//   // Handle deleting a view
//   const handleDeleteView = (viewId: number) => {
//     deleteViewMutation.mutate(viewId);
//   };

//   // Loading states
//   if (isLoadingViews || isLoadingDefault) {
//     return <div>Loading...</div>;
//   }

//   // Error states
//   if (viewsError || defaultError) {
//     return (
//       <div>
//         <p>Error loading data:</p>
//         {viewsError && <p>Views: {viewsError.message}</p>}
//         {defaultError && <p>Default view: {defaultError.message}</p>}
//         <button onClick={() => refetchViews()}>Retry</button>
//       </div>
//     );
//   }

//   return (
//     <div>
//       <h2>Form Views</h2>

//       {/* Default view section */}
//       <div>
//         <h3>Default View</h3>
//         {defaultView ? (
//           <div>
//             <p>Name: {defaultView.name}</p>
//             <p>Public: {defaultView.isPublic ? "Yes" : "No"}</p>
//             <button
//               onClick={() =>
//                 defaultView.id && handleUpdateView(defaultView.id, { name: "Updated Default View" })
//               }
//               disabled={updateViewMutation.isPending || !defaultView.id}>
//               {updateViewMutation.isPending ? "Updating..." : "Update Name"}
//             </button>
//           </div>
//         ) : (
//           <p>No default view found</p>
//         )}
//       </div>

//       {/* All views section */}
//       <div>
//         <h3>All Views</h3>
//         <button onClick={handleCreateView} disabled={createViewMutation.isPending}>
//           {createViewMutation.isPending ? "Creating..." : "Create New View"}
//         </button>

//         {formViews && formViews.length > 0 ? (
//           <ul>
//             {formViews.map((view) => (
//               <li key={view.id}>
//                 <div>
//                   <strong>{view.name}</strong>
//                   {view.isDefault && <span> (Default)</span>}
//                   {view.isPublic && <span> (Public)</span>}
//                 </div>
//                 <div>
//                   <button
//                     onClick={() =>
//                       view.id && handleUpdateView(view.id, { isPublic: !view.isPublic })
//                     }
//                     disabled={updateViewMutation.isPending || !view.id}>
//                     Toggle Public
//                   </button>
//                   <button
//                     onClick={() => view.id && handleDeleteView(view.id)}
//                     disabled={deleteViewMutation.isPending || !view.id}>
//                     {deleteViewMutation.isPending ? "Deleting..." : "Delete"}
//                   </button>
//                 </div>
//               </li>
//             ))}
//           </ul>
//         ) : (
//           <p>No views found</p>
//         )}
//       </div>

//       {/* Mutation loading states */}
//       {(createViewMutation.isPending ||
//         updateViewMutation.isPending ||
//         deleteViewMutation.isPending) && <div>Processing request...</div>}
//     </div>
//   );
// };

// export default FormViewsExample;
